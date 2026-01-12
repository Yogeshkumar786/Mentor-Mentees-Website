import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Types for PDF generation
interface StudentMeetingPDFData {
  studentName: string
  studentRollNumber: number
  mentorName: string
  department: string
  year: number
  semester: number
  meetings: Array<{
    date: string
    time?: string | null
    description?: string | null
    status: string
    facultyReview?: string | null
    attended?: boolean
  }>
}

interface FacultyGroupPDFData {
  facultyName: string
  department: string
  year: number
  semester: number
  students: Array<{
    name: string
    rollNumber: number
    program?: string
    branch?: string
  }>
  meetings: Array<{
    date: string
    time?: string | null
    description?: string | null
    status: string
    studentReviews: Array<{
      studentName: string
      rollNumber: number
      review: string
    }>
  }>
}

interface HODFacultyMentorPDFData {
  facultyName: string
  facultyEmployeeId: string
  department: string
  mentorshipGroups: Array<{
    year: number
    semester: number
    isActive: boolean
    students: Array<{
      name: string
      rollNumber: number
      program?: string
      branch?: string
    }>
  }>
  meetings: Array<{
    date: string
    time?: string | null
    description?: string | null
    status: string
    year: number
    semester: number
    studentReviews: Array<{
      studentName: string
      rollNumber: number
      review: string
    }>
  }>
}

// Helper function to format date
const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

// Helper function to format time
const formatTime = (timeStr: string | null | undefined): string => {
  if (!timeStr) return '-'
  try {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  } catch {
    return timeStr
  }
}

/**
 * Generate PDF for a student with their mentor meetings and reviews
 * Shows only the student's own reviews
 */
export function generateStudentMentorPDF(data: StudentMeetingPDFData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Mentor Meeting Report', pageWidth / 2, 20, { align: 'center' })
  
  // Student and Mentor Info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  let yPos = 35
  doc.setFont('helvetica', 'bold')
  doc.text('Student Details:', 14, yPos)
  doc.setFont('helvetica', 'normal')
  yPos += 7
  doc.text(`Name: ${data.studentName}`, 14, yPos)
  yPos += 6
  doc.text(`Roll Number: ${data.studentRollNumber}`, 14, yPos)
  yPos += 6
  doc.text(`Year: ${data.year} | Semester: ${data.semester}`, 14, yPos)
  
  yPos += 12
  doc.setFont('helvetica', 'bold')
  doc.text('Mentor Details:', 14, yPos)
  doc.setFont('helvetica', 'normal')
  yPos += 7
  doc.text(`Name: ${data.mentorName}`, 14, yPos)
  yPos += 6
  doc.text(`Department: ${data.department}`, 14, yPos)
  
  yPos += 15
  
  // Meetings Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Meeting History', 14, yPos)
  yPos += 8

  if (data.meetings.length === 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'italic')
    doc.text('No meetings recorded.', 14, yPos)
  } else {
    const tableData = data.meetings.map(meeting => [
      formatDate(meeting.date),
      formatTime(meeting.time),
      meeting.status || '-',
      meeting.description || '-',
      meeting.facultyReview || '-'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Time', 'Status', 'Description', 'Faculty Review']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 50 },
        4: { cellWidth: 60 }
      }
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-IN')} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Download
  doc.save(`Mentor_Report_${data.studentName.replace(/\s+/g, '_')}_${data.year}_Sem${data.semester}.pdf`)
}

/**
 * Generate PDF for faculty with all student reviews in their mentorship group
 */
export function generateFacultyGroupPDF(data: FacultyGroupPDFData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Mentorship Group Report', pageWidth / 2, 20, { align: 'center' })
  
  // Faculty Info
  doc.setFontSize(12)
  let yPos = 35
  doc.setFont('helvetica', 'bold')
  doc.text('Mentor Details:', 14, yPos)
  doc.setFont('helvetica', 'normal')
  yPos += 7
  doc.text(`Name: ${data.facultyName}`, 14, yPos)
  yPos += 6
  doc.text(`Department: ${data.department}`, 14, yPos)
  yPos += 6
  doc.text(`Group: Year ${data.year}, Semester ${data.semester}`, 14, yPos)
  
  // Students List
  yPos += 12
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Mentees (${data.students.length} students)`, 14, yPos)
  yPos += 8

  const studentTableData = data.students.map((s, idx) => [
    (idx + 1).toString(),
    s.name,
    s.rollNumber.toString(),
    s.program || '-',
    s.branch || '-'
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['S.No', 'Name', 'Roll No', 'Program', 'Branch']],
    body: studentTableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 45 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 }
    }
  })

  // Meetings Section
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Meeting Records', 14, yPos)
  yPos += 8

  if (data.meetings.length === 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'italic')
    doc.text('No meetings recorded.', 14, yPos)
  } else {
    // For each meeting, show details and student reviews
    for (const meeting of data.meetings) {
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Date: ${formatDate(meeting.date)} | Time: ${formatTime(meeting.time)} | Status: ${meeting.status}`, 14, yPos)
      yPos += 6
      
      if (meeting.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(`Description: ${meeting.description}`, 14, yPos)
        yPos += 6
      }
      
      yPos += 2

      // Student reviews table
      const reviewTableData = meeting.studentReviews.map(sr => [
        sr.rollNumber.toString(),
        sr.studentName,
        sr.review || '-'
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['Roll No', 'Name', 'Review']],
        body: reviewTableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 50 },
          2: { cellWidth: 107 }
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPos = (doc as any).lastAutoTable.finalY + 10
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-IN')} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Download
  doc.save(`Mentorship_Report_Year${data.year}_Sem${data.semester}_${data.facultyName.replace(/\s+/g, '_')}.pdf`)
}

/**
 * Generate PDF for HOD viewing a faculty's complete mentorship details
 * Includes all groups, students, meetings, and reviews
 */
export function generateHODFacultyMentorPDF(data: HODFacultyMentorPDFData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Faculty Mentorship Report', pageWidth / 2, 20, { align: 'center' })
  
  // Faculty Info
  doc.setFontSize(12)
  let yPos = 35
  doc.setFont('helvetica', 'bold')
  doc.text('Faculty Details:', 14, yPos)
  doc.setFont('helvetica', 'normal')
  yPos += 7
  doc.text(`Name: ${data.facultyName}`, 14, yPos)
  yPos += 6
  doc.text(`Employee ID: ${data.facultyEmployeeId}`, 14, yPos)
  yPos += 6
  doc.text(`Department: ${data.department}`, 14, yPos)
  
  // Mentorship Groups Summary
  yPos += 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Mentorship Groups (${data.mentorshipGroups.length})`, 14, yPos)
  yPos += 8

  for (const group of data.mentorshipGroups) {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    const statusText = group.isActive ? '(Active)' : '(Inactive)'
    doc.text(`Year ${group.year}, Semester ${group.semester} ${statusText} - ${group.students.length} students`, 14, yPos)
    yPos += 6

    const studentTableData = group.students.map((s, idx) => [
      (idx + 1).toString(),
      s.name,
      s.rollNumber.toString(),
      s.program || '-',
      s.branch || '-'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Name', 'Roll No', 'Program', 'Branch']],
      body: studentTableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 45 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 }
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Meetings Section
  doc.addPage()
  yPos = 20

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Meeting History (${data.meetings.length} meetings)`, 14, yPos)
  yPos += 10

  if (data.meetings.length === 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'italic')
    doc.text('No meetings recorded.', 14, yPos)
  } else {
    // Sort meetings by date (newest first)
    const sortedMeetings = [...data.meetings].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    for (const meeting of sortedMeetings) {
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.getHeight() - 70) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Year ${meeting.year}, Sem ${meeting.semester} | ${formatDate(meeting.date)} | ${formatTime(meeting.time)} | ${meeting.status}`, 14, yPos)
      yPos += 6
      
      if (meeting.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(`Description: ${meeting.description}`, 14, yPos)
        yPos += 5
      }
      
      yPos += 2

      // Student reviews table
      const reviewTableData = meeting.studentReviews.map(sr => [
        sr.rollNumber.toString(),
        sr.studentName,
        sr.review || '-'
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['Roll No', 'Name', 'Review']],
        body: reviewTableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 50 },
          2: { cellWidth: 107 }
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPos = (doc as any).lastAutoTable.finalY + 10
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-IN')} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Download
  doc.save(`Faculty_Mentorship_${data.facultyName.replace(/\s+/g, '_')}_${data.department}.pdf`)
}
