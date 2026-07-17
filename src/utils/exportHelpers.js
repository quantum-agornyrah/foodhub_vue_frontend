import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import * as XLSX from 'xlsx'

// Export orders to PDF with FoodHub branding
export function exportOrdersToPDF (orders, weekDates, weekRange, department, filename = 'FoodHub_OrderSummary') {
  // Create new PDF document (A4 landscape)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Colors
  const orangeColor = [210, 69, 30] // #D2451E

  // ===== HEADER SECTION =====
  let yPosition = 15

  // Report Title
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('Weekly Order Summary', pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 10

  // Metadata Section
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  // Left side - Week Range
  doc.text(`Week: ${weekRange}`, 15, yPosition)

  // Center - Department
  doc.text(`Department: ${department}`, pageWidth / 2, yPosition, { align: 'center' })

  // Right side - Export Date
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Exported: ${exportDate}`, pageWidth - 15, yPosition, { align: 'right' })

  yPosition += 8

  // Separator line
  doc.setDrawColor(...orangeColor)
  doc.setLineWidth(0.5)
  doc.line(15, yPosition, pageWidth - 15, yPosition)

  yPosition += 8

  // ===== PREPARE TABLE DATA =====

  function getStaffData(deptOrders){
    const staffMap = new Map()
    for (const order of deptOrders) {
      if (!staffMap.has(order.staffId)) {
        staffMap.set(order.staffId, {
          name: order.staffName || 'Unknown',
          department: order.department || 'N/A',
          ordersByDate: {},
        })
      }

      const staff = staffMap.get(order.staffId)
      staff.ordersByDate[order.date] = order.menuTitle || '-'
    }
    return Array.from(staffMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }

  // Day names
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  // Table headers
  const headers = department === 'All' ? [['Staff Name', ...dayNames]] : [['Staff Name', 'Department', ...dayNames]]

  const baseTableConfig = {
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', lineWidth: 0.3 },
    bodyStyles: { textColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 15, right: 15 },
  }

  // When "All" departments: no department column, wider name column
  // When single department: includes department column
  const tableConfig = department === 'All'
    ? {
        ...baseTableConfig,
        columnStyles: {
          0: { cellWidth: 67, fontStyle: 'bold' }, // wider Staff Name
          1: { cellWidth: 40 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
          4: { cellWidth: 40 },
          5: { cellWidth: 40 },
        },
      }
    : {
        ...baseTableConfig,
        columnStyles: {
          0: { cellWidth: 57, fontStyle: 'bold' },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 },
          6: { cellWidth: 35 },
        },
      }
  let finalY = yPosition
  let totalStaffCount = 0
  if (department === 'All') {
    // Group by department
    const deptsMap = new Map()
    for (const order of orders) {
      const dept = order.department || 'N/A'
      if (!deptsMap.has(dept)) deptsMap.set(dept, [])
      deptsMap.get(dept).push(order)
    }
    const sortedDepts = Array.from(deptsMap.keys()).sort()
    for (let index = 0; index < sortedDepts.length; index++) {
      const dept = sortedDepts[index]
      const deptOrders = deptsMap.get(dept)
      const staffOrders = getStaffData(deptOrders)
      totalStaffCount += staffOrders.length
      // Add a page break if drawing the next subheader and table would overshoot the page limit
      if (finalY > pageHeight - 45) {
        doc.addPage()
        finalY = 20
      }
      // Draw subheader
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...orangeColor)
      doc.text(`${dept} Department`, 15, finalY)
      finalY += 4
      const body = staffOrders.map(staff => [
        staff.name,
        ...weekDates.map(date => staff.ordersByDate[date] || '-'),
      ])
      autoTable(doc, {
        ...tableConfig,
        startY: finalY,
        head: headers,
        body,
      })
      finalY = doc.lastAutoTable.finalY + 10
    }
  } else {
    // Single department logic (original)
    const staffOrders = getStaffData(orders)
    totalStaffCount = staffOrders.length
    const body = staffOrders.map(staff => [
      staff.name,
      staff.department,
      ...weekDates.map(date => staff.ordersByDate[date] || '-'),
    ])
    autoTable(doc, {
      ...tableConfig,
      startY: yPosition,
      head: headers,
      body,
    })
    finalY = doc.lastAutoTable.finalY + 10
  }

  // ===== FOOD SUMMARY SECTION =====

  // Count food items
  const foodCounts = {}
  for (const order of orders) {
    const foodName = order.menuTitle || 'Unknown'
    if (foodName !== '-' && foodName !== 'Unknown') {
      foodCounts[foodName] = (foodCounts[foodName] || 0) + 1
    }
  }

  // Sort by count descending
  const sortedFoods = Object.entries(foodCounts)
    .sort((a, b) => b[1] - a[1])

  // Draw summary box
  if (sortedFoods.length > 0 && finalY < pageHeight - 40) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Food Summary:', 15, finalY)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    let summaryY = finalY + 5
    for (const [food, count] of sortedFoods) {
      if (summaryY < pageHeight - 20) {
        doc.text(`• ${food}: ${count} staff`, 20, summaryY)
        summaryY += 5
      }
    }
  }

  // ===== FOOTER =====
  const totalPages = doc.internal.getNumberOfPages()

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Footer line
    doc.setDrawColor(...orangeColor)
    doc.setLineWidth(0.5)
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15)

    // Footer text
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    // Left - Total staff
    doc.text(`Total Staff: ${totalStaffCount}`, 15, pageHeight - 10)

    // Center - Timestamp
    const timestamp = new Date().toLocaleString('en-US')
    doc.text(timestamp, pageWidth / 2, pageHeight - 10, { align: 'center' })

    // Right - Page number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' })
  }

  // ===== SAVE AND OPEN PDF =====
  const date = new Date().toISOString().split('T')[0]
  const fullFilename = `${filename}_${date}.pdf`

  // Save the PDF
  doc.save(fullFilename)

  // Open in new tab
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')

  //  URL.revokeObjectURL Memory Leak FIX
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
}

// Export orders to Excel
export function exportOrdersToExcel (orders, weekDates, filename = 'FoodHub_OrderSummary') {
  // Group orders by staff
  const staffMap = new Map()

  for (const order of orders) {
    if (!staffMap.has(order.staffId)) {
      staffMap.set(order.staffId, {
        name: order.staffName || 'Unknown',
        department: order.department || 'N/A',
        ordersByDate: {},
      })
    }

    const staff = staffMap.get(order.staffId)
    staff.ordersByDate[order.date] = order.menuTitle || '-'
  }

  // Convert to array format and sort alphabetically by name
  const staffOrders = Array.from(staffMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  // Create worksheet data
  const wsData = [['FoodHub - Order Summary Report'], []]

  // Title row

  // Header row with day names
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  wsData.push(['Staff Name', 'Department', ...dayNames])

  // Data rows
  for (const staff of staffOrders) {
    const row = [
      staff.name,
      staff.department,
      ...weekDates.map(date => staff.ordersByDate[date] || '-'),
    ]
    wsData.push(row)
  }

  // Add summary row
  wsData.push([], [`Total Staff: ${staffOrders.length}`, '', '', '', '', '', ''])

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Set column widths
  ws['!cols'] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Orders')

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0]
  const fullFilename = `${filename}_${date}.xlsx`

  // Save file
  XLSX.writeFile(wb, fullFilename)
}
