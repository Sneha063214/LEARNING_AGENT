"""
Adaptive Recommendation Engine
Continuously monitors student performance, detects repeated struggles or rapid mastery,
recommends prerequisite remediation, elevates difficulty, and keeps learning paths synchronized.
"""
from typing import Any, Dict, List

from services.gap_engine import KnowledgeGapEngine
from services.roadmap_engine import LearningPathEngine


class AdaptiveRecommendationEngine:

    @classmethod
    def evaluate_and_adapt(cls, conn, user_id: int, assessment_id: int) -> List[Dict[str, Any]]:
        """
        Runs comprehensive adaptive analysis following a completed assessment.
        Returns a list of newly generated adaptive recommendations and updates the learning roadmap.
        """
        cursor = conn.cursor()

        # 1. Fetch Assessment Details
        assessment = cursor.execute('''
            SELECT a.*, t.name as topic_name, t.prerequisite_topic_id, t.difficulty_level, s.name as subject_name
            FROM assessments a
            LEFT JOIN topics t ON a.topic_id = t.id
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.id = ?
        ''', (assessment_id,)).fetchone()

        if not assessment:
            return []

        topic_id = assessment["topic_id"]
        subject_id = assessment["subject_id"]
        score_pct = assessment["score_percentage"]
        topic_name = assessment["topic_name"] or "Subject Overview"

        # 2. Fetch or update topic proficiency
        generated_recommendations = []
        if topic_id:
            existing_prof = cursor.execute('''
                SELECT * FROM topic_proficiency WHERE user_id = ? AND topic_id = ?
            ''', (user_id, topic_id)).fetchone()

            new_level = KnowledgeGapEngine.classify_proficiency(score_pct)
            total_attempts = (existing_prof["total_attempts"] + 1) if existing_prof else 1
            previous_level = existing_prof["proficiency_level"] if existing_prof else None

            cursor.execute('''
                INSERT INTO topic_proficiency (user_id, topic_id, proficiency_level, score_percentage, total_attempts, last_assessed_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, topic_id) DO UPDATE SET
                    proficiency_level = excluded.proficiency_level,
                    score_percentage = excluded.score_percentage,
                    total_attempts = topic_proficiency.total_attempts + 1,
                    last_assessed_at = CURRENT_TIMESTAMP
            ''', (user_id, topic_id, new_level, score_pct, total_attempts))

            # 3. Rule A: Check for Prerequisite Remediation
            if new_level == "Weak" and assessment["prerequisite_topic_id"]:
                prereq = cursor.execute('''
                    SELECT t.id, t.name, tp.proficiency_level, tp.score_percentage
                    FROM topics t
                    LEFT JOIN topic_proficiency tp ON t.id = tp.topic_id AND tp.user_id = ?
                    WHERE t.id = ?
                ''', (user_id, assessment["prerequisite_topic_id"])).fetchone()

                if prereq and (not prereq["proficiency_level"] or prereq["proficiency_level"] != "Strong"):
                    rec = {
                        "user_id": user_id,
                        "topic_id": prereq["id"],
                        "recommendation_type": "prerequisite_first",
                        "title": f"Review Prerequisite: {prereq['name']}",
                        "reason": f"Your score of {score_pct}% in '{topic_name}' indicates foundational hurdles in prerequisite '{prereq['name']}'.",
                        "suggested_action": f"Complete a review session and diagnostic quiz on '{prereq['name']}' before re-attempting '{topic_name}'."
                    }
                    generated_recommendations.append(rec)

            # 4. Rule B: Check for Repeated Struggles
            if total_attempts >= 2 and new_level == "Weak":
                rec = {
                    "user_id": user_id,
                    "topic_id": topic_id,
                    "recommendation_type": "revisit_concept",
                    "title": f"Targeted Concept Revisit: {topic_name}",
                    "reason": f"You have attempted '{topic_name}' {total_attempts} times and score is currently {score_pct}%.",
                    "suggested_action": "Use the interactive AI Learning Assistant to break down difficult concepts and review curated video tutorials."
                }
                generated_recommendations.append(rec)

            # 5. Rule C: Knowledge Gap Closed Milestone
            if previous_level == "Weak" and new_level in ("Moderate", "Strong"):
                rec = {
                    "user_id": user_id,
                    "topic_id": topic_id,
                    "recommendation_type": "gap_closed",
                    "title": f"Great Job! Knowledge Gap Closed for {topic_name}",
                    "reason": f"You improved from 'Weak' to '{new_level}' with a score of {score_pct}%.",
                    "suggested_action": "Your roadmap has been updated. Continue with the next scheduled milestone."
                }
                generated_recommendations.append(rec)

            # 6. Rule D: Increase Difficulty on High Performance
            if score_pct >= 85.0:
                rec = {
                    "user_id": user_id,
                    "topic_id": topic_id,
                    "recommendation_type": "increase_difficulty",
                    "title": f"Advance to Hard Challenges: {topic_name}",
                    "reason": f"High mastery demonstrated ({score_pct}%). You are ready for higher-order problem solving.",
                    "suggested_action": "Take the Hard difficulty quiz or advance to subsequent dependent concepts."
                }
                generated_recommendations.append(rec)

        # 7. Persist recommendations into database with deduplication
        for rec in generated_recommendations:
            cursor.execute(
                """
                DELETE FROM adaptive_recommendations
                WHERE user_id = ? AND topic_id = ? AND recommendation_type = ? AND is_applied = 0
                """,
                (rec["user_id"], rec["topic_id"], rec["recommendation_type"]),
            )
            cursor.execute(
                """
                INSERT INTO adaptive_recommendations (
                    user_id, topic_id, recommendation_type, title, reason, suggested_action
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    rec["user_id"],
                    rec["topic_id"],
                    rec["recommendation_type"],
                    rec["title"],
                    rec["reason"],
                    rec["suggested_action"],
                ),
            )

        conn.commit()

        # 8. Trigger real roadmap adaptation
        LearningPathEngine.generate_or_update_roadmap(conn, user_id, subject_id)

        return generated_recommendations

    @classmethod
    def get_active_recommendations(cls, conn, user_id: int, limit: int = 6) -> List[Dict[str, Any]]:
        cursor = conn.cursor()
        rows = cursor.execute('''
            SELECT ar.*, t.name as topic_name, s.name as subject_name
            FROM adaptive_recommendations ar
            LEFT JOIN topics t ON ar.topic_id = t.id
            LEFT JOIN subjects s ON t.subject_id = s.id
            WHERE ar.user_id = ?
            ORDER BY ar.created_at DESC
            LIMIT ?
        ''', (user_id, limit)).fetchall()
        return [dict(r) for r in rows]
