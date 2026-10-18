const $=(id)=>document.getElementById(id);
const player=$('player'),start=$('start'),loading=$('loading-screen'),progress=$('load-progress');
let frame=null,timeout=null;
function fail(message){clearTimeout(timeout);loading.hidden=false;$('loading-label').textContent='提灯还没有点亮';$('loading-detail').textContent=message;$('retry').hidden=false;progress.hidden=true;$('play-status').textContent='加载未完成 · 可以重试';}
function launch(){
  if(!window.WebAssembly){fail('当前浏览器不支持游戏运行，请换用新版 Chrome、Edge 或 Firefox。');return;}
  const canvas=document.createElement('canvas');
  if(!canvas.getContext('webgl2')){fail('当前浏览器没有启用 WebGL 2，请开启硬件加速，或下载安卓版游玩。');return;}
  frame?.remove();$('start-screen').hidden=true;loading.hidden=false;$('retry').hidden=true;progress.hidden=false;progress.removeAttribute('value');$('loading-label').textContent='正在点亮提灯…';$('loading-detail').textContent='正在加载游戏资源，请稍候';$('play-status').textContent='游戏加载中';
  frame=document.createElement('iframe');frame.id='game-frame';frame.title='残响之庭游戏';frame.allow='autoplay; fullscreen; gamepad';frame.src='game/index.html';
  frame.addEventListener('error',()=>fail('连接中断，请检查网络后重新加载。'));
  $('game-mount').replaceChildren(frame);
  clearTimeout(timeout);timeout=setTimeout(()=>fail('加载时间较长。可以稍后重试，或使用下方的独立窗口。'),240000);
}
start.addEventListener('click',launch);$('retry').addEventListener('click',launch);
window.addEventListener('message',(event)=>{
  if(event.origin!==location.origin||event.source!==frame?.contentWindow||event.data?.source!=='canxiang-engine')return;
  const data=event.data;
  if(data.type==='progress'){
    if(data.total>0){const percent=Math.min(100,Math.round(data.current/data.total*100));progress.value=percent;$('loading-detail').textContent=`正在加载游戏资源 · ${percent}%`;}
    if(data.total>0&&data.current>=data.total){$('loading-label').textContent='正在唤醒残响之庭…';$('loading-detail').textContent='资源已就绪，正在启动游戏';}
  }else if(data.type==='ready'){
    clearTimeout(timeout);loading.hidden=true;$('play-status').textContent='提灯已点亮 · 点击游戏画面开始';frame.focus();
  }else if(data.type==='error'){fail(data.message||'游戏启动失败，请重新加载或尝试其他浏览器。');}
});
$('fullscreen').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else if(player.requestFullscreen)await player.requestFullscreen();else if(frame)window.open('game/index.html','_blank','noopener');else launch();}
  catch{$('play-status').textContent='浏览器未允许全屏，可使用独立窗口游玩';}
});
