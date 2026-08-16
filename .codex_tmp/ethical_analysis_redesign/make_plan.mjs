import fs from 'node:fs/promises';
const root='C:/Users/Anzan/Documents/GitHub/Mindsettle/.codex_tmp/ethical_analysis_redesign';
const lines=(await fs.readFile(`${root}/template-inspect/template-inspect.ndjson`,'utf8')).trim().split(/\r?\n/).map(JSON.parse);
const outputSlides=[];
for(let s=1;s<=5;s++){
  const ids=lines.filter(x=>x.slide===s && ['shape','textbox','image','table','chart'].includes(x.kind)).map(x=>x.id);
  outputSlides.push({outputSlide:s,sourceSlide:s,narrativeRole:`restyled original slide ${s}`,reuseMode:'duplicate-slide',editTargets:[{action:'rewrite-and-reposition',shapeIds:ids,reason:'Visual restyling only; all content preserved verbatim.'}]});
}
await fs.writeFile(`${root}/template-frame-map.json`,JSON.stringify({outputSlides,omittedSourceSlides:[]},null,2));
await fs.writeFile(`${root}/template-audit.txt`,'Five-slide widescreen academic ethics deck. Existing structure, content, notes, slide order, and footer/page markers are retained. Visual system uses dark navy, teal, coral, soft blue, and warm off-white with stronger hierarchy and consistent spacing.\n');
await fs.writeFile(`${root}/deviation-log.txt`,'Slides 1–5: typography, fills, line colors, and emphasis updated for visual appeal; no visible wording, numerical details, notes, or ordering changed.\n');
await fs.writeFile(`${root}/source-notes.txt`,'No external sources or assets added. Existing deck content and source line preserved.\n');
