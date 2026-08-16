import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

const root='C:/Users/Anzan/Documents/GitHub/Mindsettle/.codex_tmp/ethical_analysis_redesign';
const output='C:/Users/Anzan/Documents/GitHub/Mindsettle/ICT303_Ethical_Analysis_Anjan_Basnet_Redesigned.pptx';
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/template-starter.pptx`));
const C={bg:'#F7F6F2',navy:'#16213E',ink:'#182333',muted:'#647184',teal:'#0F8B7A',mint:'#DDF4EC',blue:'#DCEFF5',coral:'#E76F51',pink:'#F7DDE4',gold:'#F5E7B2',white:'#FFFFFF',line:'#D8E1E6'};
const shapeByName=(slide,name)=>slide.shapes.items.find(x=>x.name===name);
const fill=(slide,name,color,line=C.line)=>{const x=shapeByName(slide,name); if(!x)return; x.fill=color; x.line={style:'solid',fill:line,width:1};};
const text=(slide,name,{color,size,align}={})=>{const x=shapeByName(slide,name); if(!x?.text)return; if(color)x.text.color=color; if(size)x.text.fontSize=size; if(align)x.text.alignment=align;};
for(const slide of p.slides.items) slide.background.fill=C.bg;

// Slide 1 — editorial cover with a stronger visual anchor.
{
 const s=p.slides.items[0]; fill(s,'Shape 0',C.bg,C.bg); fill(s,'Shape 1',C.navy,C.navy);
 fill(s,'Shape 7',C.white,C.line); fill(s,'Shape 11',C.white,C.line);
 fill(s,'Shape 15',C.blue,C.blue); fill(s,'Shape 17',C.mint,C.mint); fill(s,'Shape 19',C.pink,C.pink); fill(s,'Shape 21',C.gold,C.gold);
 text(s,'Text 2',{color:C.white,size:13}); text(s,'Text 3',{color:C.navy,size:52}); text(s,'Text 4',{color:C.muted,size:22});
 for(const n of ['Text 9','Text 13']) text(s,n,{color:C.navy,size:19});
 for(const n of ['Text 10','Text 14']) text(s,n,{color:C.muted,size:15});
 for(const n of ['Text 16','Text 18','Text 20','Text 22']) text(s,n,{color:C.navy,size:12,align:'center'});
 text(s,'Text 23',{color:C.teal,size:16}); text(s,'Text 24',{color:C.muted,size:10}); text(s,'Text 25',{color:C.teal,size:18});
}

// Slide 2 — one dark recommendation panel and four clean theory statements.
{
 const s=p.slides.items[1]; fill(s,'Shape 3',C.navy,C.navy); fill(s,'Shape 7',C.teal,C.teal);
 for(const n of ['Shape 10','Shape 13','Shape 16','Shape 19']) fill(s,n,C.teal,C.teal);
 fill(s,'Shape 21',C.mint,'#9AD7C8');
 text(s,'Text 0',{color:C.teal,size:14}); text(s,'Text 1',{color:C.navy,size:38}); text(s,'Text 2',{color:C.muted,size:18});
 for(const n of ['Text 5','Text 6','Text 8']) text(s,n,{color:C.white});
 for(const n of ['Text 9','Text 12','Text 15','Text 18']) text(s,n,{color:C.navy,size:20});
 for(const n of ['Text 11','Text 14','Text 17','Text 20']) text(s,n,{color:C.muted,size:16});
 text(s,'Text 22',{color:C.teal,size:17}); text(s,'Text 23',{color:C.muted,size:10}); text(s,'Text 24',{color:C.teal,size:18});
}

// Slide 3 — clearer data journey and risk palette.
{
 const s=p.slides.items[2];
 fill(s,'Shape 3',C.white,C.line); fill(s,'Shape 7',C.white,C.line); fill(s,'Shape 11',C.blue,C.blue); fill(s,'Shape 15',C.blue,C.blue); fill(s,'Shape 18',C.navy,C.navy);
 for(const n of ['Shape 6','Shape 10','Shape 14']) fill(s,n,C.teal,C.teal);
 const tags=[['Shape 21',C.blue],['Shape 23',C.mint],['Shape 25',C.pink],['Shape 27',C.gold],['Shape 29','#E5E1F5']]; for(const [n,c] of tags) fill(s,n,c,c);
 text(s,'Text 0',{color:C.teal,size:14}); text(s,'Text 1',{color:C.navy,size:38}); text(s,'Text 2',{color:C.muted,size:18});
 for(const n of ['Text 19','Text 20']) text(s,n,{color:C.white});
 for(const n of ['Text 31','Text 33','Text 35','Text 37']) text(s,n,{color:C.navy,size:17});
 for(const n of ['Text 32','Text 34','Text 36','Text 38']) text(s,n,{color:C.muted,size:15});
 for(const n of ['Text 22','Text 24','Text 26','Text 28','Text 30']) text(s,n,{color:C.navy,size:12,align:'center'});
 text(s,'Text 39',{color:C.muted,size:10}); text(s,'Text 40',{color:C.teal,size:18});
}

// Slide 4 — paired comparison with distinct ethical themes.
{
 const s=p.slides.items[3]; fill(s,'Shape 3',C.white,C.line); fill(s,'Shape 4',C.white,C.line); fill(s,'Shape 13',C.navy,C.navy);
 text(s,'Text 0',{color:C.teal,size:14}); text(s,'Text 1',{color:C.navy,size:38}); text(s,'Text 2',{color:C.muted,size:18});
 for(const n of ['Text 6','Text 10']) text(s,n,{color:C.navy,size:17}); text(s,'Text 7',{color:C.teal,size:26}); text(s,'Text 11',{color:C.coral,size:26});
 for(const n of ['Text 8','Text 12']) text(s,n,{color:C.muted,size:17}); text(s,'Text 14',{color:C.white,size:16,align:'center'});
 text(s,'Text 15',{color:C.muted,size:10}); text(s,'Text 16',{color:C.teal,size:18});
}

// Slide 5 — decisive close with a warm action checklist.
{
 const s=p.slides.items[4]; fill(s,'Shape 3',C.navy,C.navy); fill(s,'Shape 17',C.teal,C.teal);
 text(s,'Text 0',{color:C.teal,size:14}); text(s,'Text 1',{color:C.navy,size:38}); text(s,'Text 2',{color:C.muted,size:18});
 for(const n of ['Text 4','Text 5','Text 6']) text(s,n,{color:C.white});
 for(const n of ['Text 7','Text 9','Text 11','Text 13','Text 15']) text(s,n,{color:C.teal,size:18});
 for(const n of ['Text 8','Text 10','Text 12','Text 14','Text 16']) text(s,n,{color:C.navy,size:17});
 text(s,'Text 18',{color:C.muted,size:10}); text(s,'Text 19',{color:C.muted,size:10}); text(s,'Text 20',{color:C.teal,size:18});
}

const pptx=await PresentationFile.exportPptx(p); await pptx.save(output);
for(let i=0;i<p.slides.items.length;i++){
 const png=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});
 await fs.mkdir(`${root}/final-render`,{recursive:true});
 await fs.writeFile(`${root}/final-render/slide-${i+1}.png`,new Uint8Array(await png.arrayBuffer()));
 const layout=await p.export({slide:p.slides.items[i],format:'layout'});
 await fs.mkdir(`${root}/final-layout`,{recursive:true});
 await fs.writeFile(`${root}/final-layout/slide-${i+1}.layout.json`,new Uint8Array(await layout.arrayBuffer()));
}
const check=await p.inspect({kind:'slide,textbox,shape,notes',maxChars:300000}); await fs.writeFile(`${root}/final-inspect.ndjson`,check.ndjson??'','utf8');
console.log(output);
