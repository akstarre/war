//War

//Hide images on load
const base_url = "https://www.deckofcardsapi.com/"
const sendRequest = async (URL) => {
  try {
    const response = await fetch(`${base_url}${URL}`)
    const data = await response.json() //parse as JSON
    return data
  } catch (err) {
    console.log(`Failed to fetch: ${URL}, ${err}`)
  }
}

if (!localStorage.getItem('deckID')) {
  sendRequest('api/deck/new/shuffle/?deck_count=1')
    .then(data => {
      localStorage.setItem('deckID', data.deck_id)
      console.log(data)

    })
  //Show Deal Button  
  document.querySelector('#deal').classList.remove('hidden')
}

//Create Piles
document.querySelector('#deal').addEventListener('click', dealCards)

function dealCards() {
  let array1 = []
  let array2 = []
  //Draw 52 Cards
  sendRequest(`api/deck/${localStorage.getItem('deckID')}/draw/?count=52`)
    .then(data => {
      console.log(data)
      for (i = 0; i < data.cards.length; i++) {
        if (i % 2 == 0) {
          array1.push(data.cards[i].code)
        } else {
          array2.push(data.cards[i].code)
        }
      }
      localStorage.setItem('pile1', array1.join())
      localStorage.setItem('pile2', array2.join())
      //Create Player 1 & 2 Piles
      if (!data.piles) {
        sendRequest(`api/deck/${localStorage.getItem('deckID')}/pile/player1/add/?cards=${localStorage.getItem('pile1')}`)
          .then(data => {
            console.log(data)
            document.querySelector('#p1cards').innerText = data.piles.player1.remaining
          })

        sendRequest(`api/deck/${localStorage.getItem('deckID')}/pile/player2/add/?cards=${localStorage.getItem('pile2')}`)
          .then(data => {
            console.log(data)
            document.querySelector('#p2cards').innerText = data.piles.player2.remaining

          })
      }
    })
  //Show Game Buttons, player decks - hide starter deck
  document.querySelector('#deal').classList.add('hidden')
  document.querySelector('#draw').classList.remove('hidden')
  document.querySelector('#check').classList.remove('hidden')
  document.querySelector('.deck').classList.add('hidden')
  document.querySelector('#p1deck').classList.remove('hidden')
  document.querySelector('#p2deck').classList.remove('hidden')
}


//Draw Cards from piles
document.querySelector('#draw').addEventListener('click', drawCards)

function drawCards() {
  drawP1Card()
  drawP2Card()
  document.querySelector('#player1').classList.remove('hidden')
  document.querySelector('#player2').classList.remove('hidden')

  if (data.piles.player1.remaining == 0) {
    document.querySelector('#winning1').innerText = "PLAYER 2 HAS WON THE GAME!"
    document.querySelector('#winning2').innerText = "PLAYER 2 HAS WON THE GAME!"
    document.querySelector('#draw').classList.add('hidden')
    document.querySelector('#check').classList.add('hidden')
    document.querySelector('#war').classList.add('hidden')
  } else if (data.piles.player2.remaining == 0) {
    document.querySelector('#winning1').innerText = "PLAYER 1 HAS WON THE GAME!"
    document.querySelector('#winning2').innerText = "PLAYER 1 HAS WON THE GAME!"
    document.querySelector('#draw').classList.add('hidden')
    document.querySelector('#check').classList.add('hidden')
    document.querySelector('#war').classList.add('hidden')
  }
}

//Draw player 1 card
const drawP1Card = async () => {
  await sendRequest(`api/deck/${localStorage.getItem('deckID')}/pile/player1/draw/random/?count=1`)
    .then(data => {
      console.log(data)
      document.querySelector('#player1').src = data.cards[0].image
      document.querySelector('#p1cards').innerText = data.piles.player1.remaining
      localStorage.setItem('p1Val', data.cards[0].value)
      localStorage.setItem('p1Code', data.cards[0].code)
    })

}

//Draw player 2 card
const drawP2Card = async () => {
  await sendRequest(`api/deck/${localStorage.getItem('deckID')}/pile/player2/draw/random/?count=1`)
    .then(data => {
      console.log(data)
      document.querySelector('#player2').src = data.cards[0].image
      document.querySelector('#p2cards').innerText = data.piles.player2.remaining
      localStorage.setItem('p2Val', data.cards[0].value)
      localStorage.setItem('p2Code', data.cards[0].code)
    })
}



//Check Win
document.querySelector('#check').addEventListener('click', checkWin)

function checkWin() {
  let p1Val = convertToNum(localStorage.getItem('p1Val'))
  let p2Val = convertToNum(localStorage.getItem('p2Val'))
  let p1Code = localStorage.getItem('p1Code')
  let p2Code = localStorage.getItem('p2Code')
  if (p1Val > p2Val) {
    document.querySelector('#winning1').innerText = 'Player 1 Wins!'
    document.querySelector('#winning2').innerText = ''
    sendRequest(`api/deck/${localStorage.getItem('deckID')}/pile/player1/add/?cards=${p1Code},${p2Code}`)
      .then(data => {
        console.log(data)
        document.querySelector('#p1cards').innerText = data.piles.player1.remaining
        document.querySelector('#p2cards').innerText = data.piles.player2.remaining
      })
  } else if (p1Val < p2Val) {
    document.querySelector('#winning1').innerText = ''
    document.querySelector('#winning2').innerText = 'Player 2 Wins!'
    sendRequest(`api/deck/${localStorage.getItem('deckID')}/pile/player2/add/?cards=${p1Code},${p2Code}`)
      .then(data => {
        console.log(data)
        document.querySelector('#p1cards').innerText = data.piles.player1.remaining
        document.querySelector('#p2cards').innerText = data.piles.player2.remaining
      })
  } else {
    document.querySelector('#winning1').innerText = 'Time to Declare War!'
    document.querySelector('#winning2').innerText = 'Time to Declare War!'
    document.querySelector('#war').classList.remove('hidden')
    document.querySelector('#draw').classList.add('hidden')
  }

}

//Declare War!!
document.querySelector('#war').addEventListener('click', declareWar)

function declareWar() {
  declareP1War()
  declareP2War()
}

//Declare player 1 war
const declareP1War = async () => {
  let codeArry = []
  await sendRequest(`api/deck/${localStorage.getItem('deckID')}/pile/player1/draw/random/?count=4`)
    .then(data => {
      console.log(data)
      document.querySelector('#player1').src = data.cards[3].image
      localStorage.setItem('p1Val', data.cards[3].value)
      for (i = 0; i < 4; i++) {
        codeArry.push(data.cards[i].code)
      }
    })
  localStorage.setItem('p1Code', codeArry.join())
}

//Declare player 2 war
const declareP2War = async () => {
  let codeArry = []
  await sendRequest(`api/deck/${localStorage.getItem('deckID')}/pile/player2/draw/random/?count=4`)
    .then(data => {
      console.log(data)
      document.querySelector('#player2').src = data.cards[3].image
      localStorage.setItem('p2Val', data.cards[3].value)
      for (i = 0; i < 4; i++) {
        codeArry.push(data.cards[i].code)
      }
    })
  localStorage.setItem('p2Code', codeArry.join())
}


//Start New Game
document.querySelector('#new').addEventListener('click', newGame)
function newGame() {
  localStorage.clear()
  location.reload()
  document.querySelector('#player1').src = ""
  document.querySelector('#player2').src = ""
}


//Convert cards to values
function convertToNum(val) {
  if (val === 'ACE') {
    return 14
  } else if (val === 'KING') {
    return 13
  } else if (val === 'QUEEN') {
    return 12
  } else if (val === 'JACK') {
    return 11
  } else {
    return Number(val)
  }
}
