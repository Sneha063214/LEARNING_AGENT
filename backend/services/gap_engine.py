"""
Knowledge Gap Detection Engine
Analyzes student assessment answers, calculates topic accuracy, classifies into Strong/Moderate/Weak,
and produces explainable reasoning based on student performance.
"""
from typing import Any, Dict, List


class KnowledgeGapEngine:
    STRONG_THRESHOLD = 80.0
    MODERATE_THRESHOLD = 60.0

    @classmethod
    def classify_proficiency(cls, score_percentage: float) -> str:
        """Rule-based, verifiable proficiency classification"""
        if score_percentage >= cls.STRONG_THRESHOLD:
            return "Strong"
        elif score_percentage >= cls.MODERATE_THRESHOLD:
            return "Moderate"
        else:
            return "Weak"

    @classmethod
    def analyze_assessment(cls, total_questions: int, correct_count: int,
                           topic_name: str, incorrect_questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes an assessment submission and generates an explainable knowledge gap report.
        """
        score_pct = round((correct_count / total_questions * 100), 1) if total_questions > 0 else 0.0
        level = cls.classify_proficiency(score_pct)

        # Generate clear, verifiable reasons for the classification
        reasons = []
        if level == "Weak":
            reasons.append(
                f"Scored {score_pct}% ({correct_count}/{total_questions} correct), which is below the 60% mastery threshold."
            )
            if incorrect_questions:
                missed_topics = [q.get("question_text", "")[:70] + "..." for q in incorrect_questions[:3]]
                reasons.append(
                    f"Struggled on fundamental question concepts, including: {', '.join(missed_topics)}"
                )
            reasons.append(
                "Needs foundational review and targeted practice problems before advancing to dependent concepts."
            )
        elif level == "Moderate":
            reasons.append(
                f"Scored {score_pct}% ({correct_count}/{total_questions} correct). Demonstrates basic understanding but lacks consistency."
            )
            reasons.append(
                "Reviewing missed problem types and practicing edge cases is recommended to reach full mastery (>80%)."
            )
        else:
            reasons.append(
                f"Scored {score_pct}% ({correct_count}/{total_questions} correct). Solid conceptual comprehension and problem-solving execution."
            )
            reasons.append(
                "Ready for advanced challenges and subsequent dependent topics in the curriculum."
            )

        return {
            "score_percentage": score_pct,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "proficiency_level": level,
            "reasons": reasons,
            "topic_name": topic_name,
            "is_gap": level == "Weak"
        }

    @classmethod
    def aggregate_student_gaps(cls, conn, user_id: int, subject_id: int = None) -> List[Dict[str, Any]]:
        """
        Aggregates persistent topic proficiency records to generate a comprehensive gap matrix.
        """
        query = '''
            SELECT tp.topic_id, tp.proficiency_level, tp.score_percentage, tp.total_attempts, tp.last_assessed_at,
                   t.name as topic_name, t.difficulty_level, t.estimated_minutes, t.subject_id,
                   s.name as subject_name
            FROM topic_proficiency tp
            JOIN topics t ON tp.topic_id = t.id
            JOIN subjects s ON t.subject_id = s.id
            WHERE tp.user_id = ?
        '''
        params = [user_id]
        if subject_id:
            query += " AND t.subject_id = ?"
            params.append(subject_id)
        query += " ORDER BY tp.score_percentage ASC, t.order_index ASC"

        cursor = conn.execute(query, params)
        rows = cursor.fetchall()

        results = []
        for r in rows:
            results.append({
                "topic_id": r["topic_id"],
                "topic_name": r["topic_name"],
                "subject_id": r["subject_id"],
                "subject_name": r["subject_name"],
                "proficiency_level": r["proficiency_level"],
                "score_percentage": r["score_percentage"],
                "total_attempts": r["total_attempts"],
                "difficulty_level": r["difficulty_level"],
                "estimated_minutes": r["estimated_minutes"],
                "last_assessed_at": r["last_assessed_at"]
            })
        return results
