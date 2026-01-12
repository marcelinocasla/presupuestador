import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuoteResult, CompanyInfo } from '@/types';
import { generatePoolLayout, LayoutShape } from '@/lib/poolLayout';
import { TILE_SIZE, ARC_WATER_RADIUS, ARC_TOTAL_RADIUS } from '@/lib/constants';

interface PDFGeneratorProps {
    quote: QuoteResult;
    companyInfo: CompanyInfo;
    clientInfo: {
        name: string;
        phone: string;
        address: string;
        transport: string;
    };
    visualizerRef?: HTMLElement | null; // Deprecated but kept for signature compatibility
    includeImage: boolean;
    // New Props for reconstruction
    poolType: 'concrete' | 'fiber';
    poolDimensions: { length: number; width: number };
    solarium: { top: number; bottom: number; left: number; right: number };
    hasArc: boolean;
    arcSide: 'top' | 'bottom' | 'left' | 'right';
    color: string;
}

export async function generatePDF({
    quote, companyInfo, clientInfo, includeImage,
    poolType, poolDimensions, solarium, hasArc, arcSide, color
}: PDFGeneratorProps) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // 1. Header (Logo & Company Info)
    let hasLogo = false;
    if (companyInfo.logoUrl) {
        try {
            doc.addImage(companyInfo.logoUrl, 'PNG', 15, 15, 30, 30);
            hasLogo = true;
        } catch (e) {
            console.warn('Could not add logo', e);
        }
    }

    if (!hasLogo) {
        // Draw Branded "AC" Badge
        doc.setFillColor(37, 99, 235); // Blue-600
        doc.roundedRect(15, 15, 20, 20, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("AC", 25, 28, { align: 'center' });
        doc.setTextColor(40); // Reset for name
    }

    const textX = hasLogo ? 50 : 40;

    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.setFont("helvetica", "bold");
    doc.text(companyInfo.name || "ATÉRMICOS CELINA", textX, 25);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(companyInfo.address || "Ventas a todo el país", textX, 32);
    doc.text(companyInfo.phone || "Consultas por WhatsApp", textX, 37);

    // Date
    const dateStr = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Fecha: ${dateStr}`, pageWidth - 15, 25, { align: 'right' });

    // 2. Client Info
    doc.setDrawColor(200);
    doc.line(15, 50, pageWidth - 15, 50);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Datos del Cliente", 15, 60);

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Nombre: ${clientInfo.name}`, 15, 68);
    doc.text(`Teléfono: ${clientInfo.phone}`, 15, 73);
    doc.text(`Dirección: ${clientInfo.address}`, 15, 78);
    doc.text(`Transporte: ${clientInfo.transport}`, pageWidth / 2, 68);

    let finalY = 85;

    // 3. Items Table
    const tableRows = quote.items.map(item => [
        item.quantity,
        item.name,
        `$${item.unitPrice.toLocaleString()}`,
        `$${item.subtotal.toLocaleString()}`
    ]);

    if (quote.palletCost > 0) {
        tableRows.push([String(quote.palletCount), "Servicio de Palletizado", "-", `$${quote.palletCost.toLocaleString()}`]);
    }
    if (quote.shippingCost > 0) {
        tableRows.push(["1", "Costo de Envío", "-", `$${quote.shippingCost.toLocaleString()}`]);
    }

    if (quote.installation) {
        tableRows.push(["1", `Mano de Obra: ${quote.installation.description}`, "-", `$${quote.installation.laborCost.toLocaleString()}`]);
    }

    tableRows.push(["", "", "TOTAL", `$${quote.total.toLocaleString()}`]);

    autoTable(doc, {
        startY: finalY,
        head: [['Cant.', 'Descripción', 'Precio Unit.', 'Subtotal']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        footStyles: { fillColor: [240, 240, 240], textColor: 20 },
        columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: function (data) {
            if (data.row.index === tableRows.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [240, 240, 240];
            }
        }
    });

    // @ts-expect-error - jsPDF doesn't expose lastAutoTable on its type but it exists at runtime
    finalY = doc.lastAutoTable.finalY + 10;

    // 3.1 Material List (If Installation included)
    if (quote.installation) {
        if (finalY + 40 > doc.internal.pageSize.height) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(52, 152, 219); // Cyan/Blue
        doc.setFont("helvetica", "bold");
        doc.text("Lista de Materiales Sugerida (A comprar por el cliente)", 15, finalY);
        finalY += 5;

        const materialRows = quote.installation.materials.items.map(m => [m.name, `${m.quantity} ${m.unit}`]);

        autoTable(doc, {
            startY: finalY,
            head: [['Material', 'Cantidad Est.']],
            body: materialRows,
            theme: 'grid',
            headStyles: { fillColor: [52, 152, 219] }, // Cyan-ish
            styles: { fontSize: 9 },
            margin: { left: 15, right: 100 } // Narrower table for materials
        });

        // @ts-expect-error
        finalY = doc.lastAutoTable.finalY + 5;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont("helvetica", "italic");
        doc.text("* Materiales NO incluidos en la venta. Lista orientativa para corralón.", 15, finalY);
        finalY += 10;
    }

    // 4. Vector Planimetry (No html2canvas!)
    if (includeImage) {
        // Check Page break
        if (finalY + 80 > doc.internal.pageSize.height) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(50);
        doc.text("Diseño y Planimetría", 15, finalY);
        finalY += 10;

        // --- Vector Drawing Start ---
        try {
            const layout = generatePoolLayout(poolDimensions, poolType, solarium, hasArc, arcSide);

            // Colors from props or default
            // Hardcode standard printable colors for better PDF look
            const C_WATER = [14, 165, 233]; // Blue-500 #0ea5e9
            const C_BORDER = [75, 85, 99]; // Gray-600 (Darker for border)
            const C_TILE = [230, 230, 230]; // Light Gray

            // Calculate Scale
            // Target width: 60mm
            const targetWidthMM = 60;
            const scale = targetWidthMM / layout.viewBoxW;

            // Center offsets
            const xOffset = (pageWidth - targetWidthMM) / 2;
            const startY = finalY;

            // Helper for Transforms
            const tX = (val: number) => xOffset + (val * scale);
            const tY = (val: number) => startY + (val * scale);
            const tS = (val: number) => val * scale;

            // Draw Shapes
            layout.shapes.forEach(shape => {
                if (shape.type === 'rect') {
                    // Set color
                    if (shape.colorType === 'water') {
                        doc.setFillColor(C_WATER[0], C_WATER[1], C_WATER[2]);
                        doc.setDrawColor(C_WATER[0], C_WATER[1], C_WATER[2]);
                    } else if (shape.colorType === 'border') {
                        doc.setFillColor(C_BORDER[0], C_BORDER[1], C_BORDER[2]);
                        doc.setDrawColor(255, 255, 255); // White border lines
                    } else {
                        doc.setFillColor(C_TILE[0], C_TILE[1], C_TILE[2]);
                        doc.setDrawColor(200, 200, 200);
                    }

                    // Rounded Rect?
                    if (shape.w && shape.h) {
                        // jsPDF rounded rect: roundedRect(x, y, w, h, rx, ry, style)
                        // Style: 'F' = fill, 'FD' = fill + draw stroke
                        const style = shape.colorType === 'tile' || shape.colorType === 'border' ? 'FD' : 'F';
                        const rx = (shape.r || 0.05) * scale;
                        doc.roundedRect(tX(shape.x), tY(shape.y), tS(shape.w), tS(shape.h), rx, rx, style);
                    }
                } else if (shape.type === 'circle') {
                    if (shape.r) {
                        doc.setFillColor(C_WATER[0], C_WATER[1], C_WATER[2]);
                        doc.circle(tX(shape.x), tY(shape.y), tS(shape.r), 'F');
                    }
                } else if (shape.type === 'arc-wedge') {
                    const segments = 8;
                    const angleStep = 180 / segments;
                    const rIn = ARC_WATER_RADIUS;
                    const rOut = ARC_TOTAL_RADIUS;

                    const rotationRad = (shape.rotation || 0) * Math.PI / 180;
                    const CX = tX(shape.x);
                    const CY = tY(shape.y);

                    doc.setFillColor(C_BORDER[0], C_BORDER[1], C_BORDER[2]);
                    doc.setDrawColor(255, 255, 255);
                    doc.setLineWidth(0.2);

                    for (let i = 0; i < segments; i++) {
                        const startAngle = i * angleStep;
                        const endAngle = (i + 1) * angleStep;

                        const startRad = (startAngle * Math.PI) / 180 + rotationRad;
                        const endRad = (endAngle * Math.PI) / 180 + rotationRad;

                        // Calculate the 4 vertices of the segment
                        const x1 = CX + tS(rIn * Math.cos(startRad));
                        const y1 = CY + tS(rIn * Math.sin(startRad));
                        const x2 = CX + tS(rOut * Math.cos(startRad));
                        const y2 = CY + tS(rOut * Math.sin(startRad));
                        const x3 = CX + tS(rOut * Math.cos(endRad));
                        const y3 = CY + tS(rOut * Math.sin(endRad));
                        const x4 = CX + tS(rIn * Math.cos(endRad));
                        const y4 = CY + tS(rIn * Math.sin(endRad));

                        // Draw as filled polygon with stroke
                        doc.lines(
                            [
                                [x2 - x1, y2 - y1],
                                [x3 - x2, y3 - y2],
                                [x4 - x3, y4 - y3],
                                [x1 - x4, y1 - y4]
                            ],
                            x1, y1, [1, 1], 'FD', true
                        );
                    }
                }
            });

            // Dimensions Text
            doc.setFontSize(8);
            doc.setTextColor(100);
            // Width Label (at bottom)
            doc.text(`${poolDimensions.width}m`, tX(layout.viewBoxW / 2), tY(layout.viewBoxH) + 5, { align: 'center' });
            // Length Label (at right)
            doc.text(`${poolDimensions.length}m`, tX(layout.viewBoxW) + 5, tY(layout.viewBoxH / 2), { angle: -90, align: 'center' });

            finalY += (layout.viewBoxH * scale) + 15;
            // Add note
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("* Representación vectorial aproximada.", 15, finalY);


        } catch (err) {
            console.error(err);
            doc.text("Error generando plano 2D", 15, finalY);
        }
    }

    // 5. Commercial Conditions
    if (finalY + 40 > doc.internal.pageSize.height) {
        doc.addPage();
        finalY = 20;
    }

    doc.setDrawColor(230);
    doc.line(15, finalY, pageWidth - 15, finalY);
    finalY += 10;

    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.setFont("helvetica", "bold");
    doc.text("Puntos importantes:", 15, finalY);
    finalY += 7;

    doc.setFontSize(9);
    doc.setTextColor(70);
    doc.setFont("helvetica", "normal");

    const points = [
        "- Presupuesto válido por 3 días, sujeto a variación de precios",
        "- Forma de pago: 50% Anticipo, resto contra entrega al momento de la entrega.",
        "- Los envíos al interior requieren pago de palletizado y envío al transporte elegido por el cliente.",
        "- Las descargas en obra corren por cuenta del cliente."
    ];

    points.forEach(point => {
        doc.text(point, 15, finalY);
        finalY += 5;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Presupuesto generado por ATÉRMICOS CELINA System', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`Presupuesto_${clientInfo.name.replace(/\s+/g, '_')}.pdf`);
}
