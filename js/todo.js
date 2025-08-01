document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('tasks');
    const totalEl = document.getElementById('total');
    const doneEl = document.getElementById('finished');
    const fillEl = document.getElementById('progress_fill');
    const msgBox = document.getElementById('message');
    const charCt = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitMsg');
    const endDay = document.getElementById('endDay');
    const endSplash = document.getElementById('endSplash');
    const endPerc = document.getElementById('endPercent');
    const dayName = document.getElementById('dayName');
    const dayNum = document.getElementById('dayNum');

    function updateStats(){
        const items = Array.from(listEl.children);
        const total = items.length;
        const done = items.filter(li => li.classList.contains('done')).length;
        totalEl.textContent = total;
        doneEl.textContent = done;
        const pct = total === 0? 0 : Math.round((done/total)*100);
        fillEl.style.width = `${pct}%`;
    }

    function addTask(text){
        const li = document.createElement('li');
        li.className = 'task_item';
        
        const span = document.createElement('span');
        span.textContent = text;
        span.style.cursor = 'pointer';
        span.addEventListener('click', () => {
            li.classList.toggle('done');
            updateStats();
        });

        const del = document.createElement('button');
        del.className = 'delete';
        del.textContent = 'X';
        del.addEventListener('click', () => {
            li.remove();
            updateStats();
        });
        li.append(span, del);
        listEl.appendChild(li);
        updateStats();
    }

    submitBtn.addEventListener('click', () => {
        const text = msgBox.value.trim();
        if(!text) return;
        addTask(text);
        msgBox.value= '';
        charCt.textContent = '0/50';
    });

    msgBox.addEventListener('input', () => {
        charCt.textContent = `${msgBox.value.length}/50`;
    });


    const today = new Date();
    dayName.textContent = today.toLocaleDateString('en-US', {weekday:'short'}).toUpperCase();
    dayNum.textContent = today.getDate();


    endDay.addEventListener('click', () =>{
        const total = +totalEl.textContent;
        const done = +doneEl.textContent;
        const pct = total === 0?0 : Math.round((done/total) * 100);
        endPerc.textContent = `${pct}%`;
        endSplash.style.display='flex';
    });
});



