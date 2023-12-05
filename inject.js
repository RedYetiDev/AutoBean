window.onload = () => {
    class AutoBean {
        constructor() {
            this.canBotRun = false;
            this.options = {
                secondsToWaitOnNewWord: 120,
                accuracy: this.calculateAccuracy(95),
            };
            this.intervals = { test: null, click: null, deltest: null };
            this.logTextArea = document.getElementById("logtext");
            this.setupEventListeners();
            this.run();
        }

        toggleBot(value) {
            const status = value ? "enabled" : "disabled";
            this.log(`${status} the bot`);
            this.canBotRun = value;
            if (!value) this.stop();
        }

        calculateAccuracy(targetAccuracy) {
            const randomSign = Math.random() > 0.5 ? -1 : 1;
            const randomOffset = Math.random() * 5 * randomSign;
            return Math.round((targetAccuracy + randomOffset) / 100);
        }

        getQuestionTimeout() {
            const timerContainer = document.getElementById('timer-container');
            return parseInt(timerContainer?.getAttribute('data-timeout')) || null;
        }

        log(message) {
            this.logTextArea.value += `${message}\n`;
        }

        stop() {
            this.log("Bot stopped");
            clearInterval(this.intervals.click);
            clearInterval(this.intervals.deltest);
            this.canBotRun = false;
        }

        forceSkip() {
            this.skipToNextQuestion();
            const questionTimeout = this.getQuestionTimeout() || 30;
            const skipTime = questionTimeout + 6;
            this.log(`Skipping question - waiting for ${skipTime} seconds`);
            this.intervals.click = setTimeout(() => this.handleNewWord(), skipTime * 1000);
            this.stop();
        }

        handleQuestion() {
            this.log("Detected a question");
            setupButtons(true);
            const questionTimeout = this.getQuestionTimeout() || 30;
            const shouldSkip = Math.random() > this.options.accuracy;
            const time = shouldSkip ? questionTimeout + 6 : questionTimeout - 6;
            const message = shouldSkip ? "Skipping question" : `Answering in ${time} seconds`;
            if (shouldSkip) setupSkippingNextQuestion();
            else setupAnswerCountdown(time);
            this.log(message);
            this.intervals.click = setTimeout(() => (shouldSkip ? this.handleNewWord() : this.answer()), time * 1000);
        }

        handleTest() {
            this.intervals.deltest = setTimeout(() => {
                this.canBotRun = true;
                this.log("Bot re-enabled for testing");
                this.run();
            }, 2000);
        }

        handleNewWord() {
            const nextBtn = document.getElementById("next-btn");
            if (nextBtn) {
                const choices = document.querySelectorAll("#choice-section li");
                this.log("Clicked the next button");
                choices.forEach((item) => item.click());
                nextBtn.click();
            }
            this.handleTest();
        }

        answer() {
            resetState();
            try {
                document.Pass.click();
                this.log("Answered the question");
                this.handleTest();
            } catch (error) {
                this.handleTest();
            }
        }

        run() {
            if (this.canBotRun) {
                try {
                    if (document.Pass) {
                        this.canBotRun = false;
                        this.handleQuestion();
                    } else if (document.getElementById("next-btn")) {
                        const waitingMessage = `New Word - Waiting for ${this.options.secondsToWaitOnNewWord} seconds`;
                        this.log(waitingMessage);
                        setTimeout(() => this.handleNewWord(), this.options.secondsToWaitOnNewWord * 1000);
                        this.stop();
                    } else {
                        setTimeout(() => this.handleTest(), 3000);
                        this.stop();
                    }
                } catch (error) {
                    this.log(error.message);
                }
            }
        }

        setupEventListeners() {
            const clearLogButton = document.getElementById('clear-log');
            clearLogButton.addEventListener('click', () => (this.logTextArea.value = ""));

            const enableBotButton = document.getElementById('enable-bot-button');
            const enableBotLabel = document.getElementById('enable-bot-label');
            enableBotButton.addEventListener('click', () => {
                const value = enableBotLabel.innerText === "Enable";
                enableBotLabel.innerText = value ? "Disable" : "Enable";
                this.toggleBot(value);
            });

            const skipButton = document.getElementById('skip-button');
            skipButton.addEventListener('click', () => this.forceSkip());

            const answerButton = document.getElementById('answer-button');
            answerButton.addEventListener('click', () => this.answer());

            setupButtons(false);
        }
    }

    const autoBean = new AutoBean();
    const interval = setInterval(() => autoBean.run(), 1000);

    const offcanvasElements = document.getElementsByClassName('offcanvas');
    for (const offcanvasElement of offcanvasElements) {
        offcanvasElement.addEventListener('hide.bs.offcanvas', () => {
            document.querySelectorAll('.expand-button').forEach((element) => element.classList.remove('sidebar-active'));
        });

        offcanvasElement.addEventListener('show.bs.offcanvas', () => {
            document.querySelectorAll('.expand-button').forEach((element) => element.classList.add('sidebar-active'));
        });
    }

    function resetState() {
        setVisibility('skipping', false);
        setVisibility('answering', false);
        setupButtons(false);
    }

    function setupButtons(status) {
        document.getElementById('skip-button').disabled = !status;
        document.getElementById('answer-button').disabled = !status;
    }

    function setupSkippingNextQuestion() {
        setVisibility('skipping', true);
        setVisibility('answering', false);
        clearInterval(countdownInterval);
    }

    function setVisibility(id, visible) {
        const element = document.getElementById(id);
        if (visible) element.classList.replace('invisible', 'visible');
        else element.classList.replace('visible', 'invisible');
    }

    let countdownInterval = null;

    function setupAnswerCountdown(timeUntilAnswer) {
        clearInterval(countdownInterval);
        setVisibility('skipping', false);
        setVisibility('answering', true);

        const countdownElement = document.getElementById('countdown-answer');
        countdownElement.innerText = timeUntilAnswer;
        countdownInterval = setInterval(() => {
            timeUntilAnswer--;
            countdownElement.innerText = timeUntilAnswer;
            if (timeUntilAnswer <= 0) clearInterval(countdownInterval);
        }, 1000);
    }

    const targetAccuracySlider = document.getElementById('target-accuracy');
    const accuracyValue = document.getElementById('accuracy-value');

    targetAccuracySlider.addEventListener('input', () => {
        const value = targetAccuracySlider.value;
        accuracyValue.innerText = value;
        autoBean.options.accuracy = value / 100;
    });

    targetAccuracySlider.value = 95;
    targetAccuracySlider.dispatchEvent(new Event('input', { bubbles: true }));

    const waitTimeSlider = document.getElementById('wait-time');
    console.log(waitTimeSlider);
    const waitTimeValue = document.getElementById('wait-time-value');

    waitTimeSlider.addEventListener('input', () => {
        const value = waitTimeSlider.value;
        waitTimeValue.innerText = value
        autoBean.options.secondsToWaitOnNewWord = value;
    });

    waitTimeSlider.value = 120;
    waitTimeSlider.dispatchEvent(new Event('input', { bubbles: true }));
}