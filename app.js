var state = {
    questions: getQuestions, // loaded from external js file
    userAnswers: [],
    score: 0,
    currentQuestion: 0
};

// Target selectors 
var QUIZ_FORM = '#quiz-form';

var QUESTION = '#question h3';
var QUESTION_NUM = '#question-number';
var ANSWER_1 = 'label[for=answer-1] span';
var ANSWER_2 = 'label[for=answer-2] span';
var ANSWER_3 = 'label[for=answer-3] span';
var ANSWER_4 = 'label[for=answer-4] span';
var SCORE = '#js-current-score';
var FINAL_SCORE = '#js-final-score';
var HIGH_SCORES = '.high-scores';

var START = '.js-start';
var QUIZ = '.js-quiz';
var USER_ANSWER = '.user-answer';
var MODAL = '.js-modal';
var GIF = '#js-gif';
var RESULTS_CONTAINER = '.js-results-container';
var RESULTS = '.results';
var CORRECT = '.correct';
var INCORRECT = '.incorrect';
var POV_VIDEO_CONTAINER = '#pov-video-container';
var POV_VIDEO = '#pov-video';

// ================================================================================
// Flow control functions
// ================================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * 
// Begin the quiz
// * * * * * * * * * * * * * * * * * * * * * * * * 
function startQuiz() {
    $(START).addClass('hidden');
    resetQuiz();
    getNextQuestion();
}

// * * * * * * * * * * * * * * * * * * * * * * * * 
// 
// * * * * * * * * * * * * * * * * * * * * * * * * 
function resetQuiz() {
    state.currentQuestion = 0;
    state.score = 0;
    state.userAnswers = [];
    $(SCORE).text(state.score);
    $(RESULTS + ' div').remove(CORRECT);
    $(RESULTS + ' div').remove(INCORRECT);
    $(RESULTS_CONTAINER).addClass('hidden');
    $(POV_VIDEO_CONTAINER).addClass('hidden');
    $(POV_VIDEO).attr('src', 'assets/video/Millennium-Force-Official-POV.mp4');
    $(QUIZ).removeClass('hidden');
}

// * * * * * * * * * * * * * * * * * * * * * * * * 
// 
// * * * * * * * * * * * * * * * * * * * * * * * * 
function getNextQuestion() {
    state.currentQuestion++;
    var q = state.questions[state.currentQuestion - 1];


    updateBackgroundImg(state.currentQuestion);

    // Set question text
    $(QUESTION).text(q.question);

    shuffleArray(q.answers);
    

    // Set the 4 possible answers 
    $(ANSWER_1).text(q.answers[0]);
    $(ANSWER_2).text(q.answers[1]);
    $(ANSWER_3).text(q.answers[2]);
    $(ANSWER_4).text(q.answers[3]);

    // Set current question 
    $(QUESTION_NUM).text(state.currentQuestion);

    $(MODAL).addClass('hidden');
    $(QUIZ).removeClass('hidden');
    $(QUIZ_FORM)[0].reset();
}

// * * * * * * * * * * * * * * * * * * * * * * * * 
// 
// * * * * * * * * * * * * * * * * * * * * * * * * 
function shuffleArray(array) {
     var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}



// * * * * * * * * * * * * * * * * * * * * * * * * 
// Convert to dictionary lookup in assests.js file
// * * * * * * * * * * * * * * * * * * * * * * * * 
function updateBackgroundImg(num) {
    var src = backgroundImgs[num];
    $('body').css({'background': `url("./assets/images/${src}") no-repeat center fixed`, 
                   'background-size': 'cover'});
}

// * * * * * * * * * * * * * * * * * * * * * * * * 
// 
// * * * * * * * * * * * * * * * * * * * * * * * * 
function validateAnswer() {
    $(QUIZ).addClass('hidden');
    // Check if user answer is equal to question.solution
    var $radioChecked = $('input[name=answer]:checked', QUIZ_FORM);
    var userAnswer = $radioChecked.siblings('span').text();
    state.userAnswers.push(userAnswer);

    // update score and set appropriate GIF
    var winner = (userAnswer == state.questions[state.currentQuestion - 1].solution);
    winner ? (state.score++, setGIF(winnerGifs)) : setGIF(loserGifs);

    $(SCORE).text(state.score);
    // display feedback GIF
    $(MODAL).removeClass('hidden');
}

// * * * * * * * * * * * * * * * * * * * * * * * * 
// 
// * * * * * * * * * * * * * * * * * * * * * * * * 
function setGIF(group) {
    var randomIndex = Math.floor(Math.random() * Object.keys(group).length);
    var keys = Object.keys(group);
    var src = group[keys[randomIndex]];
    $(GIF).attr('src', src);
}

// * * * * * * * * * * * * * * * * * * * * * * * * 
// 
// * * * * * * * * * * * * * * * * * * * * * * * * 
function showResults() {
    updateBackgroundImg(-1); 
    $(MODAL).addClass('hidden');
    $(RESULTS_CONTAINER).removeClass('hidden');
    $(FINAL_SCORE).text(state.score);

    displayHighScores();

    var result_str = '';
    state.questions.forEach(function(question, questionNum) {
        var correct = (question.solution == state.userAnswers[questionNum]);
        correct ? result_str += `<div class="correct">` : result_str += `<div class="incorrect">`;
        result_str += `<h4>${question.question}</h4>`;
        if(!correct)
            result_str += `<h5 class="user-answer"><em>Your Answer: <span>${state.userAnswers[questionNum]}</span></em></h5>`;
        result_str +=`<h5 class="correct-answer">Correct Answer: <span>${question.solution}</span></h5></div>`;
    });
    
    $(RESULTS).append(result_str);
}

// * * * * * * * * * * * * * * * * * * * * * * * * 
// 
// * * * * * * * * * * * * * * * * * * * * * * * * 
function displayHighScores() {
    var all_scores = getScoresFromLocalStorage();
    all_scores.sort(function(a, b) {
        return b - a;
    });
    $(HIGH_SCORES + ' dd').remove();
    for(var i = 0; i < 5; i++) {
        if(all_scores[i] != undefined) {
            $(HIGH_SCORES).append(`<dd>${all_scores[i]} / 10</dd>`);
        }
    }
}

// * * * * * * * * * * * * * * * * * * * * * * * * 
// 
// * * * * * * * * * * * * * * * * * * * * * * * * 
function playPovVideo() {
    $(RESULTS_CONTAINER).addClass('hidden');
    $(POV_VIDEO_CONTAINER).removeClass('hidden');
    $(POV_VIDEO)[0].play();

}



// ================================================================================
// Localstorage functions to be used for user leaderboard
// ================================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * 
// Stores user's score in localstorage object
// * * * * * * * * * * * * * * * * * * * * * * * * 
function storeUserAnswerLocalStorage () {
    if (storageAvailable('localStorage')) {
        if (localStorage.getItem('scores') === null) {
            var scores_array = [state.score];
            localStorage.setItem('scores', JSON.stringify(scores_array));
        } else {
            var updatedScores = JSON.parse(localStorage.getItem('scores'));
            updatedScores.push(state.score);
            localStorage.setItem('scores', JSON.stringify(updatedScores));
        }
    }
}

// * * * * * * * * * * * * * * * * * * * * * * * *
// Get leaderboard scores from Localstorage
// * * * * * * * * * * * * * * * * * * * * * * * *
function getScoresFromLocalStorage() {
    if (storageAvailable('localStorage')) {
        return JSON.parse(localStorage.getItem('scores'));
    }
}

// * * * * * * * * * * * * * * * * * * * * * * * * 
// Checks if local storage is both supported and 
// available
// * * * * * * * * * * * * * * * * * * * * * * * * 
function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}



// ================================================================================
// Event-listeners 
// ================================================================================

function startQuizClick() {
    $('.js-start-btn').click(function(e) {
        e.preventDefault();
        startQuiz();
    });
}

function submitQuestion() {
    $(QUIZ_FORM).submit(function(e) {
        e.preventDefault();
        validateAnswer();
    });
}

function nextQuestionClick() {
    $('.js-next-btn').click(function(e) {
        e.preventDefault();
        state.currentQuestion < 10 ? getNextQuestion() : (storeUserAnswerLocalStorage(), showResults());
    });
}

function povClick() {
    $('.js-pov-btn').click(function(e) {
        e.preventDefault();
        playPovVideo();
    });
}

function retakeQuizClick() {
    $('.js-retake-btn').click(function(e) {
        e.preventDefault();
        startQuiz();
    });
}


// ================================================================================
// Main entry
// ================================================================================

$(function() {
    startQuizClick();
    submitQuestion();
    nextQuestionClick();
    povClick();
    retakeQuizClick();
});