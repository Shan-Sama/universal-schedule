import {useEffect,useState,type ReactNode} from 'react';

function inline(text:string):ReactNode[]{
  const parts=text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((part,index)=>{
    if(part.startsWith('**')&&part.endsWith('**'))return <strong key={index}>{part.slice(2,-2)}</strong>;
    if(part.startsWith('*')&&part.endsWith('*'))return <em key={index}>{part.slice(1,-1)}</em>;
    if(part.startsWith('`')&&part.endsWith('`'))return <code key={index}>{part.slice(1,-1)}</code>;
    const link=part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);if(link)return <a href={link[2]} target="_blank" rel="noreferrer" key={index}>{link[1]}</a>;
    return part;
  });
}

function isBlockStart(line:string){return /^(#{1,3}\s|[-*]\s|\d+\.\s|>\s|---$|!\[[^\]]*\]\([^)]+\)$)/.test(line.trim());}

function MarkdownGuide({markdown}:{markdown:string}){
  const lines=markdown.replace(/\r/g,'').split('\n');const nodes:ReactNode[]=[];let index=0;
  const guideUrl=new URL('./HUONG_DAN.md',window.location.href);
  while(index<lines.length){
    const line=lines[index].trim();if(!line){index++;continue}
    const image=line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);if(image){nodes.push(<figure key={index}><img src={new URL(image[2],guideUrl).toString()} alt={image[1]}/>{image[1]&&<figcaption>{image[1]}</figcaption>}</figure>);index++;continue}
    const heading=line.match(/^(#{1,3})\s+(.+)$/);if(heading){const content=inline(heading[2]);nodes.push(heading[1].length===1?<h1 key={index}>{content}</h1>:heading[1].length===2?<h2 key={index}>{content}</h2>:<h3 key={index}>{content}</h3>);index++;continue}
    if(line==='---'){nodes.push(<hr key={index}/>);index++;continue}
    if(/^[-*]\s/.test(line)){const items:string[]=[];while(index<lines.length&&/^[-*]\s/.test(lines[index].trim())){items.push(lines[index].trim().replace(/^[-*]\s+/,''));index++}nodes.push(<ul key={index}>{items.map((item,itemIndex)=><li key={itemIndex}>{inline(item)}</li>)}</ul>);continue}
    if(/^\d+\.\s/.test(line)){const items:string[]=[];while(index<lines.length&&/^\d+\.\s/.test(lines[index].trim())){items.push(lines[index].trim().replace(/^\d+\.\s+/,''));index++}nodes.push(<ol key={index}>{items.map((item,itemIndex)=><li key={itemIndex}>{inline(item)}</li>)}</ol>);continue}
    if(line.startsWith('> ')){nodes.push(<blockquote key={index}>{inline(line.slice(2))}</blockquote>);index++;continue}
    const paragraph=[line];index++;while(index<lines.length&&lines[index].trim()&&!isBlockStart(lines[index])){paragraph.push(lines[index].trim());index++}nodes.push(<p key={index}>{inline(paragraph.join(' '))}</p>);
  }
  return <div className="guide-content">{nodes}</div>;
}

export function GuideModal({onClose}:{onClose:()=>void}){
  const [markdown,setMarkdown]=useState('Đang tải hướng dẫn…');
  useEffect(()=>{
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',onKey);
    fetch('./HUONG_DAN.md').then(response=>{if(!response.ok)throw new Error();return response.text()}).then(setMarkdown).catch(()=>setMarkdown('# Hướng dẫn\nKhông tải được file `public/HUONG_DAN.md`.'));
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)};
  },[onClose]);
  return <div className="guide-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="guide-dialog" role="dialog" aria-modal="true" aria-labelledby="guide-title"><div className="guide-toolbar"><div><small>TKB UNIVERSAL V2.4</small><h2 id="guide-title">Hướng dẫn sử dụng nhanh</h2></div><div><a href="https://github.com/Shan-Sama/universal-schedule#readme" target="_blank" rel="noreferrer">README chi tiết ↗</a><button aria-label="Đóng hướng dẫn" onClick={onClose}>×</button></div></div><MarkdownGuide markdown={markdown}/></section></div>;
}
