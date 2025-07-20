const screens={
    splash: document.getElementById('screen_intro'),
    home: document.getElementById('screen_home'),
};

function show(screenName){
    Object.values(screens).forEach(s=>s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

window.addEventListener('DOMContentLoaded', ()=> {
    show('splash');
    setTimeout(()=>{
        show('home'); initHome();}, 3000);
});

function initHome(){
    initMusicNotes();
    startTour();
}

function initMusicNotes(){
    const player = document.getElementById('player');
    player.loop = true;
    const notes = document.querySelectorAll('.note');
    notes.forEach(el => {
        el.addEventListener('click', () => {
            const src = el.dataset.src;
            if(player.src.includes(src) && !player.paused){
                player.pause();
                player.currentTime = 0;
                el.classList.remove('selected');
            }
            else{
                notes.forEach(n => n.classList.remove('selected'));
                el.classList.add('selected');
                if(!player.src.includes(src)){ 
                    player.src = src
                };
                player.currentTime=0;
                player.play();
            }
        });
    });
}

function startTour(){
    const step1 = Array.from(document.querySelectorAll('#tour_steps .tour_step'));
    const steps = step1.map(el => ({
        selector: el.dataset.selector,
        position: el.dataset.position,
        message: el.innerHTML.trim()
    }));

    let idx=0;
    const overlay = document.getElementById('tour_overlay');
    const messages = overlay.querySelector('.tour_message');

    function showStep(){
        document.querySelectorAll('.highlight').forEach (el=> el.classList.remove('highlight'));

        overlay.className = `step-${idx+1}`;
        messages.innerHTML = steps[idx].message;
        overlay.style.display = 'block';

        document.querySelectorAll(steps[idx].selector).forEach(el => el.classList.add('highlight'));

        overlay.onclick = () => {
            idx++;
            if(idx < steps.length){
                showStep()
            }
            else{
                overlay.style.display = 'none';
                document.querySelectorAll('.highlight').forEach(el=> el.classList.remove('highlight'));
            };  
        };
    }
    showStep();
}