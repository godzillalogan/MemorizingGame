// 放在文件最上方
const GAME_STATE = {
	FirstCardAwaits: "FirstCardAwaits",
	SecondCardAwaits: "SecondCardAwaits",
	CardsMatchFailed: "CardsMatchFailed",
	CardsMatched: "CardsMatched",
	GameFinished: "GameFinished",
  }



const Symbols = [
	'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
	'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
	'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
	'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]


const view = {


	getCardContent(index) {
		const number = this.transformNumber((index % 13) + 1)
		const symbol = Symbols[Math.floor(index / 13)]

		return `
				<p>${number}</p>
				<img src="${symbol}" alt="">
				<p>${number}</p>`
	},


	getCardElement(index) {
		return `<div data-index="${index}" class="card back"></div>`
	},
	// 原本的寫法
  // 	const view = {
  // 		displayCards: function displayCards() { ...  }
	// }
	transformNumber(number) {
		switch (number) {
			case 1:
				return 'A'
			case 11:
				return 'J'
			case 12:
				return 'Q'
			case 13:
				return 'K'
			default:
				return number
		}
	},
	displayCards(indexes){
		const rootElement = document.querySelector('#cards')
		rootElement.innerHTML = indexes.map(index =>this.getCardElement(index)).join('')
	},

	flipCards(...cards) {
		cards.map(card=>{
		// console.log(card.dataset.index)
			if (card.classList.contains('back')) {
				card.classList.remove('back')
				card.innerHTML = this.getCardContent(Number(card.dataset.index))
				//回傳正面
				return
			}
			card.classList.add('back')
			card.innerHTML = null
			//回傳背面
	  })
	},

	pairCards(...cards) {
		cards.map(card => {
    	card.classList.add("paired")
		})
  },

	renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`;
  },
  
  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
  },

	appendWrongAnimation(...cards) {
		cards.map(card => {
			card.classList.add('wrong')
			card.addEventListener('animationend', event =>   event.target.classList.remove('wrong'), { once: true })
			})
	},
}





const utility = {
	getRandomNumberArray(count){
		//count = 5 =>[2,3,4,1,0]

		const number = Array.from(Array(count).keys())
		for(let index = number.length -1;index > 0;index--){
			let randomIndex = Math.floor(Math.random()*(index+1))

			// [1,2,3,4,5]
			// const temp = 1
			// arr[4] =temp
			// arr[0] = 5

			;[number[index],number[randomIndex]] = [number[randomIndex], number[index]]
		}


		return number
	}
}

const controller = {
	currentState: GAME_STATE.FirstCardAwaits,  // 加在第一行
	generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },

	dispatchCardAction (card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
				view.renderTriedTimes(++model.triedTimes) //增加次數
        view.flipCards(card)
        model.revealedCards.push(card)
			
				// 判斷配對是否成功
				if(model.isRevealedCardsMatched()){
					view.renderScore(model.score += 10)
					this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
					model.revealedCards = []
					this.currentState = GAME_STATE.FirstCardAwaits
				}else{
					this.currentState = GAME_STATE.CardsMatchFailed
					view.appendWrongAnimation(...model.revealedCards) 
					//1.5秒，this.resetCards 這個函式本身
					setTimeout(this.resetCards,1000)
				}

        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
	resetCards () {
		view.flipCards(...model.revealedCards)
		model.revealedCards = []
		controller.currentState = GAME_STATE.FirstCardAwaits
	}
}



const model = {

	score: 0,
  triedTimes: 0,


	revealedCards: [],
	//檢查配對：model.isRevealedCardsMatched
	isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
  }
}



controller.generateCards() // 取代 view.displayCards()

//Node List (array-like),不能用map
document.querySelectorAll('.card').forEach(card=>{
	card.addEventListener('click', event=>{
		controller.dispatchCardAction(card)
	})
})


// console.log(utility.getRandomNumberArray(5))