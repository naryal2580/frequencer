const url_encode = (string) => {
	let encoded_string = ''
	for ( let i = 0; i < string.length; i++ ) {
		encoded_string += '%' + string.charCodeAt(i).toString(16)
	}
	return encoded_string
}


isNum = (inp) => {
  return /^\d+$/.test(inp);
};


const random = () => {
  var $random = Math.random().toString(36).substring(7);
  while (isNum($random[0])) {
    var $random = random();
  }
  return $random;
};

const append_question = (id, question, votes) => {
	// _('#questions', 'div', {'class': 'mui-divider'});
	let box_id = random();
	_('#questions', 'div', {'class': 'question--box', 'id': box_id, 'qid': id, 'votes': votes});
	// A space needs to be appended after the right divider. (\xa0)
	_(`#${box_id}`, 'a', {'href': '#', 'onclick': `vote('+', ${id})`, 'style': 'color: green'}, '+');
	_(`#${box_id}`, 'span', {'class': 'mui--divider-right'}, '\xa0');
	_(`#${box_id}`, 'a', {'href': '#', 'onclick': `vote('-', ${id})`, 'style': 'color: red'}, '\xa0-');
	_(`#${box_id}`, 'span', {'class': 'mui--divider-right'}, '\xa0');
	_(`#${box_id}`, 'span', {'class': 'mui--divider-right'}, `\xa0${votes} `);
	_(`#${box_id}`, 'span', {'class': 'question', 'votes': votes}, `\xa0${question}\xa0`);
	// _(`#${box_id}`, 'span', {'class': 'mui--divider-left'}, '\xa0');
        let hid = random();
	_(`#${box_id}`, 'a', {'href': '#', 'style': 'color: #F00', 'onclick': `delete_question(${id})`, 'id': hid}, '\xa0');
	_(`#${hid}`, 'i', {'class': 'fa fa-trash', 'aria-hidden': 'false'});
	// _('#questions', 'div', {'class': 'mui-divider'});
}

const append_subject = (id, subject) => {
    // _('.subjects', 'div', {'class': 'mui-divider'});
    let elid = random();
    _('.subjects', 'li', {'class': elid});
    _(`.${elid}`, 'a', {'href': `/subject/${id}`, 'style': 'color: #000;text-decoration: none', 'id': elid})
    _(`#${elid}`, 'strong', {}, subject)
}

const delete_question = (id) => {
    let confirmed = prompt('Do you really wanna Remove the question? If so, write "ABSOLUTELY" (wihout quotes)')
    if ( confirmed == "ABSOLUTELY" ) {
        $_('DELETE', `/question/${id}`).then( r => {
            if ( r.removed ) {
                document.location = document.location.pathname;
            }
        })
    }
}

const add_question = () => {
	let question = url_encode($('#question').value)
        let url = document.URL;
	let subject_id = decodeURI(url.split('/')[url.split('/').length-1]).replace('#', '');
	if ( decodeURI(question) ) {
		$_('put', `/question/${subject_id}/${question}`).then( (resp) => {
			if ( 'id' in resp ) {
				append_question(resp.id, $('#question').value, 1);
				$('#question').value = '';
			}
		})
	}
}

const add_a_subject = () => {
	let subject = url_encode($('#subject').value)
	if ( decodeURI(subject) ) {
		$_('put', `/subject/${subject}`).then( (resp) => {
			if ( 'id' in resp ) {
				append_subject(resp.id, $('#subject').value);
				$('#subject').value = '';
			}
		})
	}
}

const get_subjects = () => {
    $_('get', '/subjects').then( resp => {
        if ( resp ) {
            resp.forEach( function(item) {
                append_subject(item.id, item.subject);
            })
        }
    })
}

const reset_database = () => {
    let confirmed = prompt('Do you really wanna Reset the Database? If so, write "ABSOLUTELY" (wihout quotes)')
    if ( confirmed === 'ABSOLUTELY' ) {
        $_('DELETE', '/database').then( r => {
            if ( r.reset ) {
                document.location = '/'
            }
        })
    }
}

const sort_questions = () => {
    // Sort DOM elements based on votes.
    // Iterate through questions and sort on the basis of votes with `box_id` as scrambling element.
    /*

too lazy to combine them :weary:

sorting : [2,4,6,3].sort((a,b)=>{if(a===0) return -1;else if(b===0) return 1;else return a-b;});

Array.sort( (a, b) => {

	if ( b === 0 ) {
		return -1
	} else if ( a === 0 ) {
		return 1
	} else {
		return b - a;
	}

})

x = 1st elem; y = 2nd elem;

y.parentNode.insertBefore(y, x);

     * */
    if (!__($('.question--box',1))){return}
    $('.question--box',1).sort( (x, y) => {
	    return Number(y.attributes.votes.value) - Number(x.attributes.votes.value);
    }).sort( (x, y) => {
	    y.parentNode.insertBefore(y, x);
    })
}

const vote = (type, id) => {
	if ( type === '+' ) {
	    var updated_value = Number($(`[qid="${id}"]`).children[4].innerText.trim()) + 1;
	} else if ( type === '-' ) {
	    var updated_value = Number($(`[qid="${id}"]`).children[4].innerText.trim()) - 1;
	} else { return }
	$_('put', `/vote?id=${id}&type=${url_encode(type)}`).then( resp => {
                if ( resp.voted === String(id) ) {
		    let qid = $(`[qid="${id}"]`);
		    qid.attributes.votes.value = updated_value;
		    qid.children[4].innerText = ` ${updated_value} `;
		    qid.children[5].attributes.votes.value = updated_value;
		    sort_questions()
                }
	})
}

get_subjects();
