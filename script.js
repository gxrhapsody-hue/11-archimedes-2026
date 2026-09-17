let comments = JSON.parse(localStorage.getItem("comments")) || [];


// SHOW COMMENTS

function showComments(){

let box = document.getElementById("comments");

box.innerHTML = "";


comments.forEach((c,index)=>{


box.innerHTML += `

<div class="comment-box">


<h3>${c.name}</h3>


<p>${c.message}</p>



<div class="reactions">


<button onclick="react(${index},'heart')">

❤️ ${c.reactions.heart ? 1 : 0}

</button>


<button onclick="react(${index},'laugh')">

😂 ${c.reactions.laugh ? 1 : 0}

</button>


<button onclick="react(${index},'like')">

👍 ${c.reactions.like ? 1 : 0}

</button>


</div>



<button onclick="editComment(${index})">

✏️ Edit

</button>



<button onclick="deleteComment(${index})">

🗑 Delete

</button>



</div>

`;

});


}



// ADD COMMENT

function addComment(){


let name = document.getElementById("name").value;

let message = document.getElementById("message").value;



if(name.trim()=="" || message.trim()==""){

alert("Please fill everything");

return;

}



comments.push({

name:name,

message:message,


reactions:{

heart:false,

laugh:false,

like:false

}


});



saveComments();


showComments();



document.getElementById("name").value="";

document.getElementById("message").value="";


}




// REACTION TOGGLE

function react(index,type){


comments[index].reactions[type] = 
!comments[index].reactions[type];


saveComments();


showComments();


}





// DELETE COMMENT

function deleteComment(index){


comments.splice(index,1);


saveComments();


showComments();


}




// EDIT COMMENT

function editComment(index){


let newMessage = prompt(

"Edit your comment:",

comments[index].message

);



if(newMessage != null && newMessage.trim()!=""){


comments[index].message = newMessage;


saveComments();


showComments();


}


}





// SAVE DATA

function saveComments(){


localStorage.setItem(

"comments",

JSON.stringify(comments)

);


}




showComments();