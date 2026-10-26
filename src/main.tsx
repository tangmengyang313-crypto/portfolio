import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from 'framer-motion';
import { ArrowUpRight, ArrowUp, ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';
import '@fontsource/kanit/latin-300.css';
import '@fontsource/kanit/latin-400.css';
import '@fontsource/kanit/latin-500.css';
import '@fontsource/kanit/latin-900.css';
import './styles.css';
import { DeferredImage } from './DeferredImage';
import { caseStudies, type CaseStudyId } from './caseStudies';

const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
const asset = (name: string) => publicUrl(`assets/${name}.webp`);
const experience = [
  { title: '传音控股｜视觉设计师（实习）', dates: '2026.03 — 2026.08', description: '海外电商详情页、促销活动、直播及广告素材设计；适配不同市场与营销场景；协同外包团队完成需求沟通、设计反馈与交付推进。' },
  { title: '比亚迪｜产品开发工程师（全职）', dates: '2023.07 — 2025.07', description: '仰望 U9、腾势 N7/N9；车机、手机及 AR 用户手册设计；主导 U9 0→1 界面样式搭建，N7/N9 使用率提升 10%。' },
  { title: '蓝月亮｜体验设计师（实习）', dates: '2023.03 — 2023.06', description: '“月亮小屋”官网及移动端体验设计；优化“再来一单 / 再次预约”、智能客服 2.0；参与人物与场景插画组件库建设。' },
  { title: '斗鱼直播｜视觉设计师（实习）', dates: '2022.09 — 2022.12', description: '大型活动 KV、Banner 与 H5 设计；支持多场营销活动视觉输出，交付及时率 99%+；支付宝充值活动带动充值量提升 10%。' },
];
const projects = [
  { name: '体验设计', english: 'EXPERIENCE DESIGN', tags: '交互体验 / 界面设计', images: [1, 4, 7], caption: '让每一次交互，都自然发生。' },
  { name: '电商设计', english: 'E-COMMERCE DESIGN', tags: '产品表达 / 商业视觉', images: [2, 5, 8], caption: '从产品价值，到视觉吸引力。' },
  { name: '运营设计', english: 'CAMPAIGN DESIGN', tags: '活动视觉 / 营销创意', images: [3, 6, 9], caption: '让创意成为沟通的第一语言。' },
];

function Fade({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: .7, delay, ease: [.25, .1, .25, 1] }}>{children}</motion.div>;
}
function ContactButton({ children = '联系我' }: { children?: React.ReactNode }) {
  return <a className="contact-button" href="#contact">{children}<ArrowUpRight size={19} aria-hidden="true"/></a>;
}
function Portrait() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const move = (e: MouseEvent) => {
      const el = ref.current; if (!el) return;
      const rect = el.parentElement!.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
      const active = Math.abs(x) < rect.width / 2 + 150 && Math.abs(y) < rect.height / 2 + 150;
      el.style.transition = active ? 'transform .3s ease-out' : 'transform .6s ease-in-out';
      el.style.transform = active ? `translate3d(${Math.max(-36, Math.min(36, x / 3))}px,${Math.max(-18, Math.min(18, y / 3))}px,0)` : 'translate3d(0,0,0)';
    };
    const reset = () => { if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)'; };
    window.addEventListener('mousemove', move, { passive: true });document.addEventListener('mouseleave', reset);
    return () => { window.removeEventListener('mousemove', move);document.removeEventListener('mouseleave', reset); };
  }, [reduced]);
  return <div className="portrait-position"><Fade delay={.6}><div ref={ref} className="portrait-magnet">
    <img className="portrait-image" src={publicUrl("assets/avery-portrait-green.webp")} {...{ fetchpriority: 'high' }} alt="Avery 首页人物肖像" width="1254" height="1254" decoding="async" loading="eager" draggable={false}/>
  </div></Fade></div>;
}
function Hero() {
  return <section className="hero" id="top">
    <nav aria-label="主导航" className="nav"><a href="#about">关于我 <span>ABOUT</span></a><a href="#services">工作经历 <span>EXPERIENCE</span></a><a href="#projects">作品 <span>PROJECTS</span></a><a href="#contact">联系我 <ArrowUpRight size={17}/></a></nav>
    <Fade delay={.15}><h1 className="hero-heading gradient">HI, I'M AVERY</h1></Fade>
    <div className="hero-subline"><span>UI/UX & VISUAL DESIGNER</span><span>EXPERIENCE FIRST. VISUALLY EXPRESSED.</span></div>
    <Portrait/>
    <div className="hero-bottom"><Fade delay={.35}><p>CRAFTING CLEAR<br/>EXPERIENCES &<br/>COMPELLING VISUALS.</p></Fade><Fade delay={.5}><ContactButton>CONTACT ME</ContactButton></Fade></div>
  </section>;
}
function PhotoRow({ ids, direction, progress }: { ids: number[]; direction: number; progress: MotionValue<number> }) {
  const x = useTransform(progress, value => direction === 1 ? -900 + value * 620 : -300 - value * 620);
  return <motion.div className="photo-track" style={{ x }}>
    {[0, 1, 2].map(copy => <div className="photo-group" key={copy} aria-hidden={copy > 0 ? true : undefined}>{ids.map((id, i) => <figure className="photo-tile" key={id}><DeferredImage src={id === 8 ? publicUrl("assets/photo-8-latest.jpg") : asset(`photo-${id}`)} style={id === 8 ? { objectPosition: "center 32%" } : undefined} width="840" height="540" decoding="async" alt={copy > 0 ? '' : `生活影像 ${i + 1}`} /></figure>)}</div>)}
  </motion.div>;
}
function Marquee() {
  const ref = useRef<HTMLElement>(null); const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const fixed = useTransform(scrollYProgress, () => .5);
  return <section ref={ref} className="marquee" id="moments" aria-label="生活影像双排滚动"><div className="section-kicker"><span>灵感，来自生活中的每一帧。</span><span>BEYOND THE SCREEN ↗</span></div><PhotoRow ids={[1, 2, 3, 4, 5]} direction={1} progress={reduced ? fixed : scrollYProgress}/><PhotoRow ids={[6, 7, 8, 9, 10]} direction={-1} progress={reduced ? fixed : scrollYProgress}/></section>;
}
function Character({ char, index, total, progress }: { char: string; index: number; total: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [index / total, Math.min(1, (index + 5) / total)], [.2, 1]);
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}
function About() {
  const ref = useRef<HTMLParagraphElement>(null); const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start .8', 'end .2'] });
  const text = '我是唐梦阳，专注于产品体验与视觉设计。我关注使用者的真实需求，也在意每一个视觉细节。从界面交互到商业表达，我希望用清晰的设计思考，让信息更易理解，让体验更有温度。一起，把想法变成看得见、用得好的设计。';
  return <section id="about" className="about">
    <DeferredImage className="decoration d1" src={asset('about-element-3')} alt="" aria-hidden="true" width="600" height="517" decoding="async"/>
    <DeferredImage className="decoration d2" src={asset('about-element-4')} alt="" aria-hidden="true" width="600" height="548" decoding="async"/>
    <DeferredImage className="decoration d3" src={asset('about-element-2')} alt="" aria-hidden="true" width="600" height="555" decoding="async"/>
    <DeferredImage className="decoration d4" src={asset('about-element-1')} alt="" aria-hidden="true" width="600" height="522" decoding="async"/>
    <Fade><span className="eyebrow">01 / 关于我</span><h2 className="section-heading gradient">ABOUT ME</h2></Fade>
    <Fade className="about-tags"><ul className="about-skills" aria-label="设计与技术能力">{['体验设计', '视觉设计', 'AIGC', 'AI coding'].map(skill => <li className="skill-pill" key={skill}>{skill}</li>)}</ul></Fade>
    <p className="about-text" ref={ref} aria-label={text}><span aria-hidden="true">{Array.from(text).map((char, i) => reduced ? <span key={i}>{char}</span> : <Character key={i} char={char} index={i} total={text.length} progress={scrollYProgress}/>)}</span></p>
    <Fade className="about-profile">
      <div className="about-education" aria-label="教育经历">
        <article className="education-item"><div><h3>香港城市大学</h3><p>人机交互</p></div><span className="education-dates">2026.9–2028.6</span></article>
        <article className="education-item"><div><h3>中国地质大学（武汉）</h3><p>视觉传达设计</p></div><span className="education-dates">2019.9–2023.6</span></article>
      </div>
    </Fade>
    <Fade><ContactButton>一起聊聊设计</ContactButton></Fade>
  </section>;
}
function Services() {
  return <section className="services" id="services"><Fade><span className="eyebrow">02 / 工作经历</span><h2 className="section-heading">EXPERIENCE</h2></Fade><div className="service-list">{experience.map(({ title, dates, description }, i) => <Fade delay={i * .05} key={title}><article className="service-item"><span className="service-number">0{i + 1}</span><div><div className="service-title"><h3><span>{title.split('｜')[0]}</span><span className="experience-role"><span className="experience-divider">｜</span>{title.split('｜')[1]}</span></h3><span className="experience-date">{dates}</span></div><p>{description}</p></div><ArrowUpRight className="service-arrow" size={30}/></article></Fade>)}</div></section>;
}
function ProjectCard({ project, index, progress, onOpen }: { project: typeof projects[number]; index: number; progress: MotionValue<number>; onOpen: (index: number) => void }) {
  const reduced = useReducedMotion();
  const scale = useTransform(progress, [index / 3, 1], [1, 1 - (2 - index) * .03]);
  return <div className="project-slot" style={{ top: `calc(var(--sticky-top) + ${index * 28}px)`, zIndex: index + 1 }}><motion.article className="project-card" style={{ scale: reduced ? 1 : scale }}>
    <div className="project-header"><span className="project-number">0{index + 1}</span><div className="project-title"><span>{project.english}</span><h3>{project.name}</h3><p>{project.tags}</p></div><button className="ghost-button" onClick={() => onOpen(index)}>浏览作品 <ArrowUpRight size={19}/></button></div>
    <div className="project-grid"><div className="project-left">{project.images.slice(0, 2).map((id, i) => <button className={`project-image image-${i}`} key={id} onClick={() => onOpen(index)} aria-label={`查看${project.name}原图 ${i + 1}`}><DeferredImage src={asset(`project-latest-${id}`)} alt={`${project.name} · 上传作品 ${i + 1}`} decoding="async"/></button>)}</div><button className="project-image project-main" onClick={() => onOpen(index)} aria-label={`查看${project.name}原图 3`}><DeferredImage src={asset(`project-latest-${project.images[2]}`)} alt={`${project.name} · 上传作品 3`} decoding="async"/></button></div>
    <div className="project-caption"><span>{project.caption}</span><span>AVERY / SELECTED WORK</span></div>
  </motion.article></div>;
}
const caseOrder: CaseStudyId[] = ['foilsense', 'leke', 'commerce', 'campaign'];
const caseLinks: CaseStudyId[] = ['foilsense', 'commerce', 'campaign'];
function ProjectDetail({ id }: { id: CaseStudyId }) {
  const study = caseStudies[id];
  const [zoomed, setZoomed] = useState(false);
  const isExperience = id === 'foilsense' || id === 'leke';
  const next = caseOrder[(caseOrder.indexOf(id) + 1) % caseOrder.length];
  return <main className="case-detail">
    <header className="case-topbar"><div className="case-topbar-inner project-detail-container"><a href="#projects" className="case-back"><ArrowLeft size={18}/>返回作品</a><span className="case-brand">AVERY / SELECTED WORK</span></div></header>
    <section className="case-intro project-detail-container"><span className="eyebrow">{study.category}</span><h1>{study.title}</h1>
      {isExperience && <nav className="case-tabs" aria-label="体验设计项目切换">{(['foilsense', 'leke'] as CaseStudyId[]).map(key => <a key={key} href={`#project/${key}`} className={`case-tab ${id === key ? 'active' : ''}`} aria-current={id === key ? 'page' : undefined}>{caseStudies[key].title}</a>)}</nav>}
      <div className="case-toolbar"><span>{study.subtitle}</span><div className="case-reading-actions"><a href={`${publicUrl("original-pdf.html")}#page=${study.pdfPage}`} target="_blank" rel="noopener noreferrer">查看原版 PDF <ArrowUpRight size={14}/></a><button onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>{zoomed ? <ZoomOut size={17}/> : <ZoomIn size={17}/>} {zoomed ? '适应屏幕' : '放大阅读'}</button></div></div>
    </section>
    <section className={`case-reader project-detail-container ${zoomed ? 'is-zoomed' : ''}`} aria-label={`${study.title}设计详情`}><div className="case-pages">
      {study.pages.map((page, i) => <DeferredImage priority={i === 0} key={page.src} src={publicUrl(page.src)} width={page.width} height={page.height} alt={`${study.title} · 设计过程与作品展示 ${i + 1}`} decoding="async"/>)}
    </div></section>
    <footer className="case-footer project-detail-container"><a href="#projects"><ArrowLeft size={17}/>返回作品</a><a href={`#project/${next}`}>下一个项目 · {caseStudies[next].title}<ArrowUpRight size={18}/></a></footer>
  </main>;
}

function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  return <section className="projects" id="projects"><Fade><span className="eyebrow">03 / 精选作品</span><h2 className="section-heading gradient">PROJECTS</h2></Fade><div className="project-stack" ref={ref}>{projects.map((project, index) => <ProjectCard key={project.name} {...{ project, index }} progress={scrollYProgress} onOpen={index => { window.location.hash = `project/${caseLinks[index]}`; }}/>)}</div></section>;
}
function Contact() {
  return <footer id="contact" className="contact"><div className="section-kicker"><span>04 / 联系我</span><a href="#top" aria-label="返回顶部">BACK TO TOP <ArrowUp size={15}/></a></div><Fade><h2 className="gradient">LET'S TALK.</h2><div className="contact-bottom"><p>好设计，从一次交流开始。<br/><span>期待你的联系</span></p><div className="contact-pending"><span className="status-dot"/> 电话：15078386882<small>（微信同号）</small></div></div></Fade><div className="footer-line"><span>AVERY © {new Date().getFullYear()}</span><span>UI/UX & VISUAL DESIGNER</span><span>保持好奇，持续创造。</span></div></footer>;
}
function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  const route = hash.startsWith('#project/') ? hash.slice('#project/'.length) : '';
  const caseId = Object.prototype.hasOwnProperty.call(caseStudies, route) ? route as CaseStudyId : null;
  useEffect(() => {
    const change = () => setHash(window.location.hash);
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useLayoutEffect(() => {
    document.title = caseId ? `${caseStudies[caseId].title} | Avery` : 'Avery — UI/UX & Visual Designer';
    if (caseId) window.scrollTo({ top: 0, behavior: 'instant' });
    else if (window.location.hash === '#projects') {
      const frame = requestAnimationFrame(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' }));
      return () => cancelAnimationFrame(frame);
    }
  }, [caseId]);
  return caseId ? <ProjectDetail key={caseId} id={caseId}/> : <main className="main-wrapper"><Hero/><Marquee/><About/><Services/><Projects/><Contact/></main>;
}

createRoot(document.getElementById('root')!).render(<App/>);

