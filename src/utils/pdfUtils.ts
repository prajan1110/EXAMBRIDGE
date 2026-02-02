import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

interface ExamResult {
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: string;
  completedAt: string;
  studentName?: string;
  studentEmail?: string;
}

/**
 * Generates an accessible PDF containing exam results
 * @param results Exam results object
 * @param questionDetails Optional array of question details
 */
export const generateResultsPDF = (
  results: ExamResult,
  questionDetails?: Array<{ 
    question: string; 
    correct: boolean; 
    answer?: string; 
    correctAnswer?: string;
  }>
): void => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add title and metadata
  doc.setProperties({
    title: `${results.quizTitle} - Results`,
    subject: 'Exam Results',
    author: 'EXAM BRIDGE Platform',
    keywords: 'exam, results, accessibility, education',
    creator: 'EXAM BRIDGE'
  });
  
  // Set font size for title
  doc.setFontSize(20);
  doc.text('EXAM BRIDGE - Results Certificate', 105, 20, { align: 'center' });

  // Add exam and student info
  doc.setFontSize(12);
  doc.text(`Exam: ${results.quizTitle}`, 20, 40);
  doc.text(`Date: ${results.completedAt}`, 20, 50);
  
  if (results.studentName) {
    doc.text(`Student Name: ${results.studentName}`, 20, 60);
  }
  
  if (results.studentEmail) {
    doc.text(`Student Email: ${results.studentEmail}`, 20, 70);
  }
  
  // Add results summary
  doc.setFontSize(16);
  doc.text('Results Summary', 105, 90, { align: 'center' });
  
  // Draw score box
  const scoreBoxX = 70;
  const scoreBoxY = 100;
  const scoreBoxWidth = 70;
  const scoreBoxHeight = 20;
  
  // Determine color based on score
  let scoreColor = '#FF5252'; // Red for failing (default)
  if (results.score >= 90) {
    scoreColor = '#4CAF50'; // Green for A+
  } else if (results.score >= 80) {
    scoreColor = '#8BC34A'; // Light Green for A
  } else if (results.score >= 70) {
    scoreColor = '#FFC107'; // Amber for B
  } else if (results.score >= 60) {
    scoreColor = '#FF9800'; // Orange for C
  }
  
  // Add colored rectangle behind score
  doc.setFillColor(scoreColor);
  doc.rect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight, 'F');
  
  // Add score text
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(14);
  doc.text(`Score: ${results.score}%`, 105, scoreBoxY + 13, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add results details as a table
  autoTable(doc, {
    startY: scoreBoxY + 30,
    head: [['Metric', 'Value']],
    body: [
      ['Total Questions', results.totalQuestions.toString()],
      ['Correct Answers', results.correctAnswers.toString()],
      ['Incorrect Answers', (results.totalQuestions - results.correctAnswers).toString()],
      ['Duration', results.duration],
    ],
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  });
  
  // Add question breakdown if available
  if (questionDetails && questionDetails.length > 0) {
    // Add some space before question breakdown
    const tableHeight = 60; // Approximate height of the results table
    
    doc.setFontSize(16);
    doc.text('Question Breakdown', 105, scoreBoxY + tableHeight + 20, { align: 'center' });
    
    const questionTableData = questionDetails.map((detail, index) => {
      return [
        `Q${index + 1}`,
        detail.question.substring(0, 50) + (detail.question.length > 50 ? '...' : ''),
        detail.correct ? 'Correct' : 'Incorrect',
      ];
    });
    
    autoTable(doc, {
      startY: scoreBoxY + tableHeight + 30,
      head: [['#', 'Question', 'Result']],
      body: questionTableData,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 130 },
        2: { cellWidth: 30 },
      },
      bodyStyles: {
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      didDrawCell: (data) => {
        // Color the "Result" cell based on correct/incorrect
        if (data.section === 'body' && data.column.index === 2) {
          const correct = questionDetails[data.row.index].correct;
          if (correct) {
            doc.setFillColor(200, 230, 201); // Light green for correct
          } else {
            doc.setFillColor(255, 205, 210); // Light red for incorrect
          }
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(0, 0, 0);
          doc.text(
            correct ? 'Correct' : 'Incorrect',
            data.cell.x + data.cell.width / 2,
            data.cell.y + data.cell.height / 2,
            { align: 'center', baseline: 'middle' }
          );
        }
      },
    });
  }
  
  // Add footer with certification
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      'This is an official record of your exam results generated by EXAM BRIDGE.',
      105,
      285,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
  }
  
  // Save the PDF
  doc.save(`${results.quizTitle.replace(/\s+/g, '_')}_Results.pdf`);
};