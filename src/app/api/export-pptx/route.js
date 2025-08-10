// src/app/api/export-pptx/route.js
// Phase 4.2: Server-side PPTX export endpoint

import { NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

export async function POST(req) {
  try {
    const { presentation, recipes: recipesIn, slides, theme_runtime, theme_gds } = await req.json();
    const recipes = Array.isArray(recipesIn) ? recipesIn : Array.isArray(slides) ? slides : null;
    if (!presentation || !recipes || !Array.isArray(recipes)) {
      return NextResponse.json({ error: 'Invalid presentation data' }, { status: 400 });
    }

    // Create new presentation
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'Nether AI';
    pptx.company = 'Nether AI';
    pptx.title = presentation.topic || 'Presentation';
    
    // Generate slides from recipes
    recipes.forEach((recipe, index) => {
      const slide = pptx.addSlide();
      
      // Set background if specified
      if (recipe.background?.color) {
        slide.background = { fill: recipe.background.color };
      }
      const primary = recipe.theme_runtime?.primary || theme_runtime?.primary || 'ffffff';
      const secondary = recipe.theme_runtime?.secondary || theme_runtime?.secondary || 'cccccc';
      const accent = recipe.theme_runtime?.accent || theme_runtime?.accent || 'ffe1c6';
      
      // Grid mapping helpers (12-col)
      const slideWidth = 10; // inches (pptx default)
      const slideHeight = 5.625; // inches (pptx default)
      const margin = 0.5; // inches
      const usableW = slideWidth - margin * 2; // 9 in
      const usableH = slideHeight - margin * 2; // ~4.625 in
      const colUnit = usableW / 12; // width per column
      const rowUnit = 0.4; // fixed row height in inches (~for 16px grid rows)

      // Add elements based on recipe
      (recipe.elements || []).forEach((element, elIndex) => {
        // Default base if grid missing
        let x = margin;
        let y = margin + (elIndex * 1.0);
        let w = usableW;
        let h = 1.0;
        if (element.grid) {
          const cs = Math.max(1, element.grid.colStart || 1);
          const ce = Math.min(13, element.grid.colEnd || 13);
          const rs = Math.max(1, element.grid.rowStart || 1);
          const re = Math.max(rs + 1, element.grid.rowEnd || (rs + 1));
          x = margin + (cs - 1) * colUnit;
          w = Math.max(0.5, (ce - cs) * colUnit);
          y = margin + (rs - 1) * rowUnit;
          h = Math.max(0.6, (re - rs) * rowUnit);
        }
        const baseOptions = {
          x, y, w, h,
          color: primary,
          fontSize: 18,
          fontFace: (theme_gds?.typography?.body_font) || 'Arial'
        };
        
        switch (element.type) {
          case 'Title':
            slide.addText(String(element.content || 'Title'), {
              ...baseOptions,
              y: 0.5,
              h: 1.5,
              fontSize: 36,
              bold: true,
              align: 'center'
            });
            break;
            
          case 'BulletedList':
            if (Array.isArray(element.content)) {
              const bulletText = element.content.map(item => `• ${item}`).join('\n');
              slide.addText(bulletText, {
                ...baseOptions,
                fontSize: 24,
                valign: 'top'
              });
            }
            break;
            
          case 'Paragraph':
            slide.addText(String(element.content || ''), {
              ...baseOptions,
              fontSize: 20,
              valign: 'top'
            });
            break;
            
          case 'Quote':
            slide.addText(`"${element.content}"`, {
              ...baseOptions,
              fontSize: 24,
              italic: true,
              align: 'center',
              valign: 'middle'
            });
            break;
            
          case 'Stat':
            const statValue = typeof element.content === 'object' ? element.content.value : element.content;
            const statDesc = typeof element.content === 'object' ? element.content.description : '';
            slide.addText(String(statValue), {
              ...baseOptions,
              fontSize: 48,
              bold: true,
              color: accent,
              align: 'center'
            });
            if (statDesc) {
              slide.addText(String(statDesc), {
                ...baseOptions,
                y: baseOptions.y + 1,
                fontSize: 18,
                align: 'center',
                color: secondary
              });
            }
            break;
          case 'Paragraph':
            // Already handled by default addText with baseOptions
            break;
          case 'Table': {
            const tbl = element.table || {};
            const headers = Array.isArray(tbl.headers) ? tbl.headers : [];
            const rows = Array.isArray(tbl.rows) ? tbl.rows : [];
            const data = headers.length ? [headers, ...rows] : rows;
            if (Array.isArray(data) && data.length) {
              try {
                slide.addTable(data, {
                  x, y, w, h,
                  fontFace: (theme_gds?.typography?.body_font) || 'Arial',
                  fontSize: 12,
                  color: primary,
                });
              } catch (_) {
                // fallback to text table
                const text = data.map(r => (Array.isArray(r) ? r.join(' | ') : String(r))).join('\n');
                slide.addText(text, { ...baseOptions, fontSize: 12 });
              }
            }
            break;
          }
          case 'Image': {
            // Server-side images may not be resolvable; use placeholder box with label
            slide.addShape(pptx.ShapeType.rect, {
              x, y, w, h,
              line: { color: secondary },
              fill: { color: '000000' },
            });
            slide.addText('Image', {
              x, y: y + h / 2 - 0.2, w, h: 0.4,
              fontSize: 16, color: secondary, align: 'center'
            });
            break;
          }
          case 'Callout': {
            slide.addShape(pptx.ShapeType.roundRect, {
              x, y, w, h,
              fill: { color: '1a1a1a' },
              line: { color: secondary },
              rectRadius: 0.15,
            });
            const title = element.content && typeof element.content === 'object' ? element.content.title : '';
            const text = element.content && typeof element.content === 'object' ? element.content.text : String(element.content || '');
            if (title) {
              slide.addText(String(title), { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: 0.4, bold: true, color: primary, fontSize: 16 });
            }
            if (text) {
              slide.addText(String(text), { x: x + 0.2, y: y + 0.6, w: w - 0.4, h: Math.max(0.6, h - 0.8), color: secondary, fontSize: 12 });
            }
            break;
          }
          default:
            break;
        }
      });
      
      // Add slide number
      slide.addText(`${index + 1}`, {
        x: 9.5,
        y: 7,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        color: 'cccccc',
        align: 'center'
      });
    });
    
    // Generate the PPTX file
    const pptxData = await pptx.write({ outputType: 'arraybuffer' });
    
    // Return the file as response
    const filename = `${(presentation.topic || 'presentation').replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
    
    return new NextResponse(pptxData, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pptxData.byteLength.toString()
      }
    });
    
  } catch (error) {
    console.error('PPTX Export Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PPTX file',
      details: error.message 
    }, { status: 500 });
  }
}
