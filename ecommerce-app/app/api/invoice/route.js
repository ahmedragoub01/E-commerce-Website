// app/api/invoice/route.js
export async function POST(request) {
  try {
    const invoiceData = await request.json(); // Parse JSON body

    const apiKey = process.env.INVOICE_API_KEY; // Get API key from environment variables
    // Generate PDF (example using an external API)
    

    const response = await fetch('https://invoice-generator.com', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${apiKey}`, // API key in headers
        },
      body: JSON.stringify(invoiceData),
    });

    const pdfBuffer = await response.arrayBuffer();



    if (!response.ok) {
      console.error("API Error Response:", errorResponse);
      throw new Error(`Invoice API failed: ${response.status} ${errorResponse}`);
    }

    // const pdfBuffer = await response.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=invoice.pdf',
      },
    });
  } catch (error) {
    console.log('Invoice generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate invoice' }), {
      status: 500,
    });
  }
}