"""
PDF Generation Service
Generates professional, printable, and downloadable learning roadmaps and progress reports
using FPDF2.
"""
import datetime
from typing import Any, Dict, List

from fpdf import FPDF
from fpdf.enums import XPos, YPos


class LearningReportPDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(14, 135, 235)  # Brand blue
        self.cell(0, 10, 'LearnPath AI - Personalized Learning Roadmap', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(100, 116, 139)
        self.cell(0, 5, f'Generated on {datetime.datetime.now().strftime("%B %d, %Y at %H:%M")}', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
        self.ln(5)
        self.set_draw_color(226, 232, 240)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}} | LearnPath AI Adaptive Education', new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')


class PDFService:

    @classmethod
    def generate_roadmap_pdf(cls, student_data: Dict[str, Any], roadmap_data: Dict[str, Any], gaps_data: List[Dict[str, Any]]) -> bytes:
        """
        Creates a PDF document containing the student's personalized roadmap,
        identified knowledge gaps, and daily learning targets.
        """
        pdf = LearningReportPDF()
        pdf.alias_nb_pages()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # 1. Student & Roadmap Header Info
        pdf.set_font('Helvetica', 'B', 13)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 8, f"Student Profile: {student_data.get('name', 'Student')}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(95, 6, f"Subject: {roadmap_data.get('subject_name', 'General')}", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(95, 6, f"Education Level: {student_data.get('education_level', 'Undergraduate')}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.cell(95, 6, f"Total Estimated Hours: {roadmap_data.get('total_estimated_hours', 0)} hrs", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(95, 6, f"Roadmap Progress: {roadmap_data.get('progress_percentage', 0)}% Completed", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(5)

        # 2. Knowledge Gap Analysis Section
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(14, 135, 235)
        pdf.cell(0, 8, "1. Knowledge Gap & Proficiency Diagnostic", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        if gaps_data:
            pdf.set_font('Helvetica', 'B', 9)
            pdf.set_fill_color(241, 245, 249)
            pdf.set_text_color(30, 41, 59)
            pdf.cell(80, 7, "Topic Name", 1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='L', fill=True)
            pdf.cell(35, 7, "Proficiency", 1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C', fill=True)
            pdf.cell(35, 7, "Score", 1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C', fill=True)
            pdf.cell(40, 7, "Attempts", 1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C', fill=True)

            pdf.set_font('Helvetica', '', 9)
            for gap in gaps_data:
                level = gap.get("proficiency_level", "Unassessed")
                if level == "Weak":
                    pdf.set_text_color(220, 38, 38)
                elif level == "Moderate":
                    pdf.set_text_color(202, 138, 4)
                else:
                    pdf.set_text_color(22, 163, 74)

                pdf.cell(80, 6, gap.get("topic_name", "")[:40], 1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='L')
                pdf.cell(35, 6, level, 1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')
                pdf.cell(35, 6, f"{gap.get('score_percentage', 0)}%", 1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')
                pdf.cell(40, 6, str(gap.get('total_attempts', 1)), 1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        else:
            pdf.set_font('Helvetica', 'I', 9)
            pdf.set_text_color(100, 116, 139)
            pdf.cell(0, 6, "No diagnostic assessment completed yet. Take an initial assessment to identify gaps.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.ln(6)

        # 3. Personalized Daily Roadmap
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(14, 135, 235)
        pdf.cell(0, 8, "2. Personalized Daily Learning Schedule", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        daily_schedule = roadmap_data.get("daily_schedule", [])
        if daily_schedule:
            for day_group in daily_schedule:
                day_num = day_group.get("day", 1)
                pdf.set_font('Helvetica', 'B', 10)
                pdf.set_text_color(15, 23, 42)
                pdf.cell(0, 6, f"Day {day_num} Learning Target", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

                pdf.set_font('Helvetica', '', 9)
                pdf.set_text_color(51, 65, 85)
                for t in day_group.get("tasks", []):
                    status_symbol = "[X]" if t.get("status") == "completed" else "[ ]"
                    prio = t.get("priority", "Medium")
                    pdf.cell(10, 5, status_symbol, 0, new_x=XPos.RIGHT, new_y=YPos.TOP, align='L')
                    pdf.cell(110, 5, f"{t.get('title')} ({t.get('estimated_minutes', 45)} mins)", 0, new_x=XPos.RIGHT, new_y=YPos.TOP, align='L')
                    pdf.cell(40, 5, f"Priority: {prio}", 0, new_x=XPos.RIGHT, new_y=YPos.TOP, align='L')
                    pdf.cell(30, 5, f"Status: {t.get('status')}", 0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
                pdf.ln(2)
        else:
            pdf.set_font('Helvetica', 'I', 9)
            pdf.set_text_color(100, 116, 139)
            pdf.cell(0, 6, "No roadmap tasks configured yet.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.ln(5)

        # 4. Actionable Study Tips
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(14, 135, 235)
        pdf.cell(0, 8, "3. Adaptive Recommendations & Focus Areas", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(71, 85, 105)
        tips = [
            "- Focus initially on 'High Priority' topics: these represent identified knowledge gaps.",
            "- Take a 5-question milestone quiz after completing each topic to confirm mastery (>80%).",
            "- Use the interactive AI Learning Assistant whenever you encounter unfamiliar terminology or bugs.",
            "- Your roadmap adapts automatically: retaking an assessment will recalculate prerequisites and priorities."
        ]
        for tip in tips:
            pdf.cell(0, 5, tip, 0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        return bytes(pdf.output())
