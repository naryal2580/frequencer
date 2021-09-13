const get_questions = () => {
    let u = document.URL;
    const subject_id = decodeURI(u.split('/')[u.split('/').length-1]);
    $_('get', `/questions?id=${subject_id}`).then( resp => {
        resp.forEach( r => {
            append_question(r.id, r.question, r.votes);
	    sort_questions();
        })
    })
}

$('#question').onkeydown = (e) => {
    if (e.key === "Enter") {
        add_question();
    }
}

get_questions()
