import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('C:/Users/Anzan/Documents/GitHub/Mindsettle/.codex_tmp/ethical_analysis_redesign/template-starter.pptx'));
for(let s=0;s<p.slides.items.length;s++){
 const sl=p.slides.items[s]; console.log('SLIDE',s+1,'bg',sl.background);
 for(const sh of sl.shapes.items.slice(0,5)) console.log(sh.id,sh.name,sh.geometry,sh.position,sh.fill,sh.line,sh.text?.toString?.(),sh.text?.style);
}
