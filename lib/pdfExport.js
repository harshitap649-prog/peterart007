// PDF export utilities for order history

export const exportOrdersToPDF = async (orders, userInfo) => {
  try {
    // Create a simple HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Order History - ${userInfo.name || 'User'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #f97316;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #f97316;
              margin: 0;
            }
            .user-info {
              margin-bottom: 30px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .order {
              margin-bottom: 30px;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .order-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #e5e7eb;
            }
            .order-id {
              font-weight: bold;
              color: #f97316;
            }
            .order-date {
              color: #6b7280;
            }
            .order-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .detail-item {
              margin-bottom: 10px;
            }
            .detail-label {
              font-weight: bold;
              color: #6b7280;
              font-size: 12px;
            }
            .detail-value {
              color: #111827;
              font-size: 14px;
            }
            .order-total {
              text-align: right;
              font-size: 18px;
              font-weight: bold;
              color: #f97316;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #e5e7eb;
            }
            .status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-confirmed { background: #dbeafe; color: #1e40af; }
            .status-delivered { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            @media print {
              .order {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Peter Art - Order History</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="user-info">
            <h2>Customer Information</h2>
            <p><strong>Name:</strong> ${userInfo.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${userInfo.email || 'N/A'}</p>
            <p><strong>Total Orders:</strong> ${orders.length}</p>
          </div>
          
          ${orders.map(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString()
            const statusClass = `status-${order.status}`
            return `
              <div class="order">
                <div class="order-header">
                  <div>
                    <div class="order-id">Order #${order.id.slice(0, 12)}</div>
                    <div class="order-date">${orderDate}</div>
                  </div>
                  <span class="status ${statusClass}">${order.status.toUpperCase()}</span>
                </div>
                
                <div class="order-details">
                  <div class="detail-item">
                    <div class="detail-label">Artwork</div>
                    <div class="detail-value">${order.artworkTitle || 'N/A'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Quantity</div>
                    <div class="detail-value">${order.quantity || 1}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Unit Price</div>
                    <div class="detail-value">₹${order.unitPrice || order.total}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Payment Method</div>
                    <div class="detail-value">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
                  </div>
                  ${order.trackingNumber ? `
                  <div class="detail-item">
                    <div class="detail-label">Tracking Number</div>
                    <div class="detail-value">${order.trackingNumber}</div>
                  </div>
                  ` : ''}
                </div>
                
                ${order.address1 ? `
                <div style="margin-top: 15px; padding: 10px; background: #f9fafb; border-radius: 4px;">
                  <div class="detail-label">Delivery Address</div>
                  <div class="detail-value">
                    ${order.fullName || ''}<br>
                    ${order.address1 || ''}<br>
                    ${order.address2 ? order.address2 + '<br>' : ''}
                    ${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}<br>
                    ${order.phone || ''}
                  </div>
                </div>
                ` : ''}
                
                <div class="order-total">
                  Total: ₹${order.total}
                </div>
              </div>
            `
          }).join('')}
          
          <div class="footer">
            <p>This is a computer-generated document. For any queries, please contact support.</p>
            <p>© ${new Date().getFullYear()} Peter Art. All rights reserved.</p>
          </div>
        </body>
      </html>
    `
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw error
  }
}

