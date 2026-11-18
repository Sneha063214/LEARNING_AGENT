"""
Personalized Learning Path Generator
Generates and adapts learning roadmaps based on knowledge gaps, topic prerequisite graphs,
proficiency ratings, and daily study allocations.
"""
from typing import Dict, List, Any
import datetime

class LearningPathEngine:
    DAILY_TARGET_MINUTES = 60  # average daily recommended pace

    @classmethod
    def generate_or_update_roadmap(cls, conn, user_id: int, subject_id: int) -> Dict[str, Any]:
        """
        Generates or refreshes a personalized learning path for the user in the given subject.
        """
        cursor = conn.cursor()

        # 1. Fetch Subject Info
        subject = cursor.execute("SELECT id, name FROM subjects WHERE id = ?", (subject_id,)).fetchone()
        if not subject:
            raise ValueError(f"Subject with id {subject_id} not found.")

        # 2. Fetch all topics for the subject
        topics_rows = cursor.execute('''
            SELECT id, name, description, difficulty_level, prerequisite_topic_id, estimated_minutes, order_index
            FROM topics
            WHERE subject_id = ?
            ORDER BY order_index ASC
        ''', (subject_id,)).fetchall()
        
        all_topics = [dict(t) for t in topics_rows]
        topic_map = {t["id"]: t for t in all_topics}

        # 3. Fetch existing user proficiencies for these topics
        proficiencies_rows = cursor.execute('''
            SELECT topic_id, proficiency_level, score_percentage, total_attempts
            FROM topic_proficiency
            WHERE user_id = ?
        ''', (user_id,)).fetchall()
        prof_map = {p["topic_id"]: dict(p) for p in proficiencies_rows}

        # 4. Determine Priority and Sequencing using Prerequisite Dependency Tree
        # We perform a topological arrangement while prioritizing Weak concepts and their ancestors
        ordered_tasks = []
        visited = set()
        in_progress = set()

        def visit(topic_id):
            if topic_id in in_progress:
                return  # Avoid cyclic dependencies if any
            if topic_id in visited or topic_id not in topic_map:
                return
            
            in_progress.add(topic_id)
            prereq_id = topic_map[topic_id]["prerequisite_topic_id"]
            if prereq_id and prereq_id in topic_map:
                visit(prereq_id)
            
            in_progress.remove(topic_id)
            visited.add(topic_id)
            ordered_tasks.append(topic_map[topic_id])

        # Prioritize topics with 'Weak' proficiency first by triggering their traversal first
        weak_topics = [t for t in all_topics if prof_map.get(t["id"], {}).get("proficiency_level") == "Weak"]
        moderate_topics = [t for t in all_topics if prof_map.get(t["id"], {}).get("proficiency_level") == "Moderate"]
        unassessed_or_strong = [t for t in all_topics if t not in weak_topics and t not in moderate_topics]

        for t in weak_topics:
            visit(t["id"])
        for t in moderate_topics:
            visit(t["id"])
        for t in unassessed_or_strong:
            visit(t["id"])

        # 5. Check if active learning path exists in database
        existing_path = cursor.execute('''
            SELECT id, title, total_estimated_hours, current_status
            FROM learning_paths
            WHERE user_id = ? AND subject_id = ? AND current_status = 'active'
        ''', (user_id, subject_id)).fetchone()

        if existing_path:
            path_id = existing_path["id"]
            # Fetch existing task completion states so user progress is preserved
            existing_tasks_rows = cursor.execute('''
                SELECT topic_id, status, completed_at
                FROM learning_path_tasks
                WHERE learning_path_id = ?
            ''', (path_id,)).fetchall()
            existing_task_status = {r["topic_id"]: (r["status"], r["completed_at"]) for r in existing_tasks_rows}
            # Clean old tasks to rebuild fresh sequence and priorities
            cursor.execute("DELETE FROM learning_path_tasks WHERE learning_path_id = ?", (path_id,))
        else:
            title = f"Adaptive Roadmap: {subject['name']}"
            cursor.execute('''
                INSERT INTO learning_paths (user_id, subject_id, title, summary, current_status)
                VALUES (?, ?, ?, ?, 'active')
            ''', (user_id, subject_id, title, f"Customized learning pathway targeting identified gaps in {subject['name']}."))
            path_id = cursor.lastrowid
            existing_task_status = {}

        # 6. Assign daily targets, priorities, and status
        current_day = 1
        current_day_minutes = 0
        total_minutes = 0
        tasks_to_insert = []

        for seq, topic in enumerate(ordered_tasks, start=1):
            t_id = topic["id"]
            est_minutes = topic.get("estimated_minutes", 45)
            total_minutes += est_minutes

            # Proficiency
            p_data = prof_map.get(t_id)
            p_level = p_data["proficiency_level"] if p_data else "Unassessed"

            if p_level == "Weak":
                priority = "High"
            elif p_level == "Moderate":
                priority = "Medium"
            else:
                priority = "Low"

            # Check if task was completed or if student achieved Strong
            saved_status, saved_completed_at = existing_task_status.get(t_id, ("pending", None))
            if p_level == "Strong":
                task_status = "completed"
                completed_at = saved_completed_at or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            else:
                task_status = saved_status if saved_status in ("pending", "in_progress") else "pending"
                completed_at = None

            # Schedule daily allocation
            if current_day_minutes + est_minutes > cls.DAILY_TARGET_MINUTES and current_day_minutes > 0:
                current_day += 1
                current_day_minutes = 0
            
            target_day = current_day
            current_day_minutes += est_minutes

            task_desc = f"Master {topic['name']} ({topic['difficulty_level']}). "
            if p_level == "Weak":
                task_desc += "Identified as a critical knowledge gap. Prioritize review and quizzes."
            elif p_level == "Moderate":
                task_desc += "Solidify concept understanding to attain mastery."
            elif p_level == "Strong":
                task_desc += "Concept already mastered. Maintain proficiency."
            else:
                task_desc += "Foundational concept in subject roadmap."

            tasks_to_insert.append((
                path_id, t_id, topic["name"], task_desc, priority, seq, est_minutes, task_status, target_day, completed_at
            ))

        cursor.executemany('''
            INSERT INTO learning_path_tasks (
                learning_path_id, topic_id, title, description, priority, sequence_order,
                estimated_minutes, status, target_day, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', tasks_to_insert)

        total_hours = round(total_minutes / 60.0, 1)
        cursor.execute('''
            UPDATE learning_paths
            SET total_estimated_hours = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (total_hours, path_id))

        conn.commit()

        return cls.get_roadmap_details(conn, path_id)

    @classmethod
    def get_roadmap_details(cls, conn, path_id: int) -> Dict[str, Any]:
        """Fetches full structured roadmap details including daily schedules and tasks."""
        cursor = conn.cursor()
        path = cursor.execute('''
            SELECT lp.*, s.name as subject_name
            FROM learning_paths lp
            JOIN subjects s ON lp.subject_id = s.id
            WHERE lp.id = ?
        ''', (path_id,)).fetchone()
        
        if not path:
            return None

        tasks = cursor.execute('''
            SELECT lpt.*, t.difficulty_level, tp.proficiency_level, tp.score_percentage
            FROM learning_path_tasks lpt
            JOIN topics t ON lpt.topic_id = t.id
            LEFT JOIN topic_proficiency tp ON lpt.topic_id = tp.topic_id AND tp.user_id = ?
            WHERE lpt.learning_path_id = ?
            ORDER BY lpt.sequence_order ASC
        ''', (path["user_id"], path_id)).fetchall()

        tasks_list = [dict(t) for t in tasks]
        
        # Calculate completion stats
        completed_tasks = sum(1 for t in tasks_list if t["status"] == "completed")
        total_tasks = len(tasks_list)
        progress_percentage = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

        # Group by target day
        days_map = {}
        for t in tasks_list:
            d = t["target_day"]
            if d not in days_map:
                days_map[d] = []
            days_map[d].append(t)

        return {
            "id": path["id"],
            "user_id": path["user_id"],
            "subject_id": path["subject_id"],
            "subject_name": path["subject_name"],
            "title": path["title"],
            "summary": path["summary"],
            "total_estimated_hours": path["total_estimated_hours"],
            "current_status": path["current_status"],
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "progress_percentage": progress_percentage,
            "tasks": tasks_list,
            "daily_schedule": [{"day": day, "tasks": d_tasks} for day, d_tasks in sorted(days_map.items())]
        }
