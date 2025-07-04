// src/api/inicioService.js

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * @param {Array} ventasDelDia  
 * @param {Object} estadisticas 
 * @param {string} usuario      
 */
export const generarPDFVentasDelDia = async (ventasDelDia, estadisticas, usuario) => {
  try {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-PE");
    const hora  = new Date().toLocaleTimeString("es-PE");

    // --- Cabecera ---
    doc.setFont("helvetica");
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("REPORTE DE VENTAS DIARIAS", 105, 25, { align: "center" });
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(1);
    doc.line(20, 30, 190, 30);

    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text(`Fecha: ${fecha}`, 20, 45);
    doc.text(`Hora de generación: ${hora}`, 20, 52);
    doc.text(`Generado por: ${usuario}`, 20, 59);

    // --- Resumen del día ---
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text("RESUMEN DEL DÍA", 20, 75);

    doc.setFillColor(248);
    doc.rect(20, 80, 170, 35, "F");

    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text("Total de Ventas:", 25, 90);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 167, 69);
    doc.text(`${estadisticas.totalVentas}`, 25, 97);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text("Ingresos Totales:", 25, 107);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 167, 69);
    doc.text(`S/ ${estadisticas.totalIngresos.toFixed(2)}`, 25, 114);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text("Promedio por Venta:", 105, 90);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 123, 255);
    doc.text(`S/ ${estadisticas.promedioVenta.toFixed(2)}`, 105, 97);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text("Métodos de Pago:", 105, 107);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(111, 66, 193);
    doc.text(
      `${estadisticas.ventasEfectivo} Efectivo / ${estadisticas.ventasTarjeta} Tarjeta`,
      105,
      114
    );

    // --- Detalle de ventas ---
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text("DETALLE DE VENTAS", 20, 135);

    // Helper para hora Lima
    const formatHora = (fechaISO, horaStr) => {
      const iso = `${fechaISO}T${horaStr}-05:00`;
      return new Date(iso).toLocaleTimeString("es-PE", {
        hour:   "2-digit",
        minute: "2-digit",
      });
    };

    const tableData = ventasDelDia.map((venta, i) => [
      (i + 1).toString(),
      `#${venta.id}`,
      formatHora(venta.fecha, venta.hora),
      `S/ ${venta.total.toFixed(2)}`,
      venta.metodoPago,
      (venta.detalles?.length || 0).toString(),
      venta.observaciones || "-",
    ]);

    autoTable(doc, {
      head: [["#", "ID Venta", "Hora", "Total", "Método", "Productos", "Observaciones"]],
      body: tableData,
      startY: 145,
      theme: "grid",
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 60],
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "right",  cellWidth: 25 },
        4: { halign: "center", cellWidth: 25 },
        5: { halign: "center", cellWidth: 20 },
        6: { halign: "left",   cellWidth: 45 },
      },
      margin: { left: 20, right: 20 },
    });

    // --- Pie de página ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generado el ${fecha} a las ${hora}`, 20, pageHeight - 20);
    doc.text("Sistema de Gestión de Ventas", 105, pageHeight - 20, { align: "center" });
    doc.text(`Página 1 de 1`, 190, pageHeight - 20, { align: "right" });
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 25, 190, pageHeight - 25);

    // --- Guardar y descargar ---
    const nombreArchivo = `ventas-${fecha.replace(/\//g, "-")}.pdf`;
    doc.save(nombreArchivo);

    return { success: true, mensaje: "PDF generado exitosamente", nombreArchivo };
  } catch (err) {
    console.error("Error al generar PDF:", err);
    throw new Error("Error al generar el PDF: " + err.message);
  }
};
