import * as search from './search.mjs'
import * as drag from './drag.mjs'
import * as board from './board.mjs'
import * as edit from './edit.mjs'
import * as stats from './stats.mjs'

import {LAYOUTS} from './layouts.mjs'

let board_type = 'stagger'
let base = {}

window.onload = async function() {
    search.init()
    drag.init()
    edit.init()
    stats.init()
  
    window.board()
    window.board()

    base = await (await fetch('percentiles.json')).json()
}

window.toggle = function() {
    const ngrams = document.getElementById('ngrams')
    const use = document.getElementById('use')

    if (ngrams.hasAttribute('hidden')) {
        ngrams.removeAttribute('hidden')
    } else {
        ngrams.setAttribute('hidden', 'true')
    }

    if (use.hasAttribute('hidden')) {
        use.removeAttribute('hidden')
    } else {
        use.setAttribute('hidden', 'true')
    }
}

window.stats = function() {
    const res = stats.analyze()

    for (const [stat, freq] of Object.entries(res)) {
        const cell = document.getElementById(stat)
        const perc = freq.toLocaleString(
            undefined,{style: 'percent', minimumFractionDigits:2}
        )

        let color = ''
        for (let i=0; i < 5; i++) {
            if (freq > base[stat][i]) {
                color = `var(--color-${4-i})`
            }
        }

        cell.innerHTML = `${stat}: ${perc}`
        cell.style.background = color
    } 
}

window.theme = function(name) {
    const curr = document.getElementById('theme')
    curr.href = `themes/${name}.css`
}

window.mirror = function() {
    const grid = document.getElementById('grid')
    const keys = grid.children

    let letters = []
    for (const key of keys) {
        letters.push(key.innerHTML)
    }

    for (let row=0; row < 3; row++) {
        for (let col=0; col < 10; col++) {
            const key = keys[(2-row)*10 + col]
            const letter = letters.pop()

            key.className = `cell center ${letter}`
            key.innerHTML = letter
        }
    }

    window.stats()
}

window.copy = function() {
    const grid = document.getElementById('grid')
    
    let text = ''
    let row = []

    for (const key of grid.children) {
        const letter = key.innerHTML.toLowerCase()
        row.push(letter)

        if (row.length == 10) {
            text += row.join(' ') + '\n'
            row = []
        }
    }

    text = text.slice(0, -1)

    navigator.clipboard.writeText(text)
}

window.store = function() {
    let layouts = {}

    if ('layouts' in localStorage) {
        layouts = JSON.parse(localStorage.layouts)
    }

    const name = document.getElementById('search').value.toLowerCase()

    if (name in LAYOUTS) {
        alert(`The name "${name}" is already taken`)
        return
    }

    const grid = document.getElementById('grid')

    let letters = ''
    for (const key of grid.children) {
        letters += key.innerHTML.toLowerCase()
    }

    layouts[name] = letters
    localStorage.layouts = JSON.stringify(layouts);
}

window.board = function() {
    switch (board_type) {
        case 'stagger':
            board.ortho()
            board_type = 'ortho'
            break
        case 'ortho':
            board.stagger()
            board_type = 'stagger'
            break
    }
}

window.heatmap = function() {
    const repeatmap = document.getElementById('repeatmap')

    if (repeatmap.disabled) {
        repeatmap.removeAttribute('disabled')
    } else {
        repeatmap.setAttribute('disabled', '')
    }
}