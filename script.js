class Card {
    constructor(board) {
        this.board = board;
        this.defaultNumberOfCardsToCreate = 5;
        this.numberOfCardsToCreate = this.getNumberOfCardsToCreate();
        this.cardsInPlay = [];
        this.isFlipAllowed = true;
        this.cardsSetFounded = 0;
        this.score = document.querySelector(".score");
        this.rope = document.querySelector(".rope");
        this.restartBttn = document.querySelector("#restartBttn");
        this.bestScoreElem = document.querySelector('.bestScore');
        this.bestScoreValueElem = document.querySelector('.bestScore span');
        this.newBestScoreElem = document.querySelector('.newBestScore');
        this.hintIconElem = document.querySelector('.hintIcon');
        this.settings = document.querySelector('.settings');
        this.inputNumberElem = document.querySelector('.inputNumber');
    }

    getNumberOfCardsToCreate() {
        return Number(localStorage.getItem("numberOfCardsToCreate")) || this.defaultNumberOfCardsToCreate;
    }

    setNumberOfCardsToCreate(value) {
        localStorage.setItem('numberOfCardsToCreate', value);
    }

    createCardHtml(value) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'cardContainer options';

        const card = document.createElement('div');
        card.className = 'card';
        cardContainer.appendChild(card);

        const front = document.createElement('figure');
        front.className = 'front';

        const back = document.createElement('figure');
        back.className = 'back';
        back.style.backgroundImage = "url('images/card-images/" + value + ".jpg')";

        card.appendChild(front);
        card.appendChild(back);

        cardContainer.setAttribute('card-value', value);
        return cardContainer;
    }

    addLogicToNavigationBar() {
        const header = document.querySelector('.header');
        const navigationBarItems = [...document.querySelectorAll('.header > a')];
        const contentChildren = [...document.querySelectorAll('.content > div')];
        const navigationBarItemsIndex = {};
        let lastItemIndex = 0;

        navigationBarItems.forEach((item, index) => (navigationBarItemsIndex[item.innerHTML] = index));

        header.addEventListener('click', (event) => {
            const index = navigationBarItemsIndex[event.target.innerHTML];
            if (!(index !== undefined && contentChildren[index] !== undefined)) return;

            navigationBarItems[lastItemIndex].classList.remove("active");
            navigationBarItems[index].classList.add("active");

            contentChildren[lastItemIndex].classList.add('hide');
            contentChildren[index].classList.remove('hide');
            lastItemIndex = index;
        })
    }

    addLogicToRestartBttn() {
        this.restartBttn.addEventListener('click', () => window.location.reload());
    }

    addLogicToHintIcon() {
        this.hintIconElem.addEventListener('click', () => {
            const hasFoundedAllCards = this.cardsSetFounded === this.numberOfCardsToCreate;
            const isHintAlreadyActive = document.querySelector('.card.glowBorder');
            if (hasFoundedAllCards || isHintAlreadyActive) return;

            const alreadyFlippedCard = document.querySelector('.cardContainer:not([alreadyfounded]) .card.flippedfront')?.closest('.cardContainer');
            const cardToFind = alreadyFlippedCard || document.querySelector('.cardContainer:not([alreadyfounded])');
            const cardToFindValue = cardToFind.getAttribute('card-value');
            const cardsToHint = document.querySelectorAll(`.cardContainer[card-value="${cardToFindValue}"]`)
            cardsToHint[0].classList.add("floatCard");
            cardsToHint[0].querySelector('.card').classList.add("glowBorder");
            cardsToHint[1].classList.add("floatCard");
            cardsToHint[1].querySelector('.card').classList.add("glowBorder");
            this.hintIconElem.classList.add('active');

            this.changeScore(-1);
        });
    }

    changeScore(value) {
        this.score.innerHTML = Number(this.score.innerHTML) + value;
    }

    addLogicToCards() {
        const playerWonTheGame = () => {
            [...this.board.children].forEach(card => {
                card.classList.remove('options');
                card.classList.add('gameOver');
            });
            this.board.classList.add('fadeOut');

            setTimeout(() => {
                const bestScore = this.getBestScore();
                const currentScore = Number(this.score.innerHTML);

                this.board.classList.add("hide");
                this.restartBttn.classList.remove("hide");
                this.hintIconElem.classList.add("hide");
                this.rope.classList.add('middle');
                this.bestScoreElem.classList.remove("hide");
                this.bestScoreValueElem.innerHTML = Math.max(currentScore, bestScore);

                if (currentScore > bestScore) {
                    this.setBestScore(currentScore);
                    this.newBestScoreElem.classList.remove("hide");
                }
            }, 4500);
        }

        const handleWhenBothCardsAreSame = () => {
            if (this.cardsInPlay[0].querySelector('.card').classList.contains("glowBorder")) this.hintIconElem.classList.remove('active');
            this.cardsInPlay[0].classList.remove("floatCard");
            this.cardsInPlay[0].querySelector('.card').classList.remove("glowBorder");
            this.cardsInPlay[0].setAttribute("alreadyFounded", "true");

            this.cardsInPlay[1].classList.remove("floatCard");
            this.cardsInPlay[1].querySelector('.card').classList.remove("glowBorder");
            this.cardsInPlay[1].setAttribute("alreadyFounded", "true");

            setTimeout(() => {
                this.changeScore(2);

                this.cardsInPlay[0].querySelector('.back').style.backgroundImage = "url('images/won.jpg')";
                this.cardsInPlay[1].querySelector('.back').style.backgroundImage = "url('images/won.jpg')";
                this.cardsInPlay = [];
                this.isFlipAllowed = true;
            }, 1000);

            this.cardsSetFounded++;

            const hasPlayerWonTheGame = this.cardsSetFounded == this.numberOfCardsToCreate;
            if (hasPlayerWonTheGame) playerWonTheGame();
        }

        const handleWhenBothCardsAreNotSame = () => {
            setTimeout(() => {
                this.changeScore(-1);

                this.cardsInPlay[0].querySelector('.card').classList.remove("flippedfront");
                this.cardsInPlay[1].querySelector('.card').classList.remove("flippedfront");
                this.cardsInPlay = [];
                this.isFlipAllowed = true;
            }, 1000);
        }

        this.board.addEventListener('click', (event) => {
            const cardContainer = event.target.closest('.cardContainer');
            if (!cardContainer) return;

            const card = cardContainer.querySelector('.card');
            if (cardContainer.hasAttribute('alreadyFounded') || !this.isFlipAllowed || card.classList.contains('flippedfront')) return;
            card.classList.add("flippedfront");
            this.cardsInPlay.push(cardContainer);

            if (this.cardsInPlay.length === 2) {
                this.isFlipAllowed = false;

                const areBothCardsSame = this.cardsInPlay[0].getAttribute('card-value') == this.cardsInPlay[1].getAttribute('card-value');
                areBothCardsSame ? handleWhenBothCardsAreSame() : handleWhenBothCardsAreNotSame();
            }
        })
    }

    addCardsToBoard() {
        const cardsArr = [];
        for (let i = 0; i < this.numberOfCardsToCreate; i++) {
            cardsArr.push(this.createCardHtml(i), this.createCardHtml(i))
        }

        this.shuffleArr(cardsArr);
        this.addLogicToCards();
        cardsArr.forEach(card => this.board.appendChild(card));
    }

    shuffleArr(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    setBestScore(score) {
        localStorage.setItem('bestScore', score);
    }

    getBestScore() {
        return Number(localStorage.getItem("bestScore"));
    }

    addLogicToSettings() {
        this.inputNumberElem.value = this.getNumberOfCardsToCreate();

        const handleChangeInput = (elem) => this.inputNumberElem[elem.innerHTML === "-" ? 'stepDown' : 'stepUp']();

        const handleSubmitBttn = () => {
            this.setNumberOfCardsToCreate(isNaN(this.inputNumberElem.value) ? this.defaultNumberOfCardsToCreate : Number(this.inputNumberElem.value));
            window.location.reload();
        }

        this.settings.addEventListener('click', ({ target }) => {
            const eventListenerMap = {
                inputControl: handleChangeInput,
                submitBttn: handleSubmitBttn,
            }

            eventListenerMap[target.id]?.(target);
        })
    }

    start() {
        this.addLogicToNavigationBar();
        this.addCardsToBoard();
        this.addLogicToRestartBttn();
        this.addLogicToHintIcon();
        this.addLogicToSettings();
    }
}

const board = document.getElementById("game-board");
const cards = new Card(board);
cards.start();