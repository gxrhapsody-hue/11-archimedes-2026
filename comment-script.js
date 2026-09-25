console.log("MY SCRIPT FILE LOADED");


const SUPABASE_URL = "https://tqnbacntxcdkugjalbos.supabase.co";

const SUPABASE_KEY = "sb_publishable_ZCkYFgmP95lqZas63nErgQ_MncUPeXV";


const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let myUserId = localStorage.getItem("user_id");

if(!myUserId){

    myUserId = crypto.randomUUID();

    localStorage.setItem(
        "user_id",
        myUserId
    );

}

console.log("Supabase connected");


let likedComments = JSON.parse(localStorage.getItem("likedComments")) || [];

let likedReplies = JSON.parse(localStorage.getItem("likedReplies")) || [];

// SHOW COMMENTS

async function showComments(){

    const box = document.getElementById("comments");

    box.innerHTML = "Loading comments...";


    const {data, error} = await client
    .from("comments")
    .select("*")
    .order("created_at",{ascending:false});


    if(error){

        console.log("COMMENT ERROR:", error);

        box.innerHTML = "Failed to load comments";

        return;

    }


    console.log("COMMENTS:", data);


    box.innerHTML = "";


    for(let comment of data){

    box.innerHTML += `

    <div class="comment-box">

        <div class="user-info">

    <div class="avatar">
        ${comment.name ? comment.name.charAt(0).toUpperCase() : "?"}
    </div>


    <div>

        <h3>${comment.name}</h3>

        <small>
        ${timeAgo(comment.created_at)}
        ${comment.edited ? " •  Edited" : ""}
        </small>

    </div>

</div>


        <p>${comment.message}</p>
        

        

        <button onclick="replyComment(${comment.id})">
         Reply
        </button>


        <button 
        id="reply-count-${comment.id}" 
        onclick="toggleReplies(${comment.id})">
        🔥 0 replies
        </button>


        <div id="replies-${comment.id}" class="replies hidden">
        </div>



        <div class="reactions">


        <button onclick="likeComment(${comment.id})">
        ${likedComments.includes(comment.id) ? "❤️" : "🤍"} ${comment.likes ?? 0}
        </button>



        ${
       comment.user_id === myUserId ? `

      <div class="menu-container">

      <button class="menu-btn" onclick="toggleMenu(${comment.id})">
       ⋮
   </button>


<div class="comment-actions" id="menu-${comment.id}">

<button class="edit-btn"
onclick='editComment(${comment.id}, ${JSON.stringify(comment.message)})'>
Edit
</button>


<button class="delete-btn"
onclick="deleteComment(${comment.id}, this)">
Delete
</button>

</div>

</div>

` : ""

}


        </div>


    </div>


    `;


    // ADD THIS
    countReplies(comment.id);

     }

}


// ADD COMMENT

async function addComment(){


    console.log("ADD COMMENT CLICKED");



    let nameType = document.getElementById("nameType").value;


    let name = document.getElementById("name").value;


    if(nameType=="Anonymous"){

        name="Anonymous";

    }



    let message = document.getElementById("message").value;



    if(name.trim()=="" || message.trim()==""){

        alert("Please fill everything");

        return;

    }



    const {error} = await client
    .from("comments")
    .insert([

    {
    name:name,
    message:message,
    likes:0,
    user_id:myUserId,
    edited:false
    }

    ]);



    if(error){

        console.log("ADD ERROR:", error);

        alert("Error posting comment");

        return;

    }



    document.getElementById("name").value="";

    document.getElementById("message").value="";


    showComments();


}










// LIKE COMMENT

async function likeComment(id){

    console.log("LIKE CLICKED:", id);


    const {data, error} = await client
    .from("comments")
    .select("likes")
    .eq("id", id)
    .single();


    if(error){

        console.log("GET LIKE ERROR:", error);
        return;

    }

    
  
    let liked = likedComments.includes(id);

    let newLikes;


    if(liked){

        // REMOVE LIKE
        newLikes = Math.max((data.likes || 0) - 1, 0);

        likedComments = likedComments.filter(
            item => item !== id
        );


    }else{

        // ADD LIKE
        newLikes = (data.likes || 0) + 1;

        likedComments.push(id);

    }


    localStorage.setItem(
        "likedComments",
        JSON.stringify(likedComments)
    );



    const {error:updateError}=await client
    .from("comments")
    .update({
        likes:newLikes
    })
    .eq("id",id);



    if(updateError){

    console.log("UPDATE LIKE ERROR:",updateError);
    return;

}


await showComments();

}





// DELETE COMMENT

async function deleteComment(id, button){

    const {data,error}=await client
    .from("comments")
    .select("*")
    .eq("id",id)
    .single();


    if(error){
        console.log(error);
        return;
    }


    if(data.user_id !== myUserId){

        alert("You can only delete your own comment");
        return;

    }


    let commentBox = button.closest(".comment-box");


    commentBox.classList.add("delete-animation");


    const {error:deleteError}=await client
    .from("comments")
    .delete()
    .eq("id",id);


    if(deleteError){

        console.log(deleteError);
        return;

    }


    setTimeout(()=>{

        showComments();

    },400);


}







// EDIT COMMENT

async function editComment(id,oldMessage){


    const {data,error}=await client
    .from("comments")
    .select("*")
    .eq("id",id)
    .single();



    if(error){

        console.log(error);

        return;

    }



    if(data.user_id !== myUserId){

        alert("You can only edit your own comment");

        return;

    }



    let newMessage = prompt(
        "Edit your comment:",
        oldMessage
    );



    if(newMessage==null || newMessage.trim()==""){

        return;

    }



    const {error: updateError}=await client
.from("comments")
.update({
    message:newMessage,
    edited:true,
    edited_at:new Date()
})
.eq("id",id);


if(updateError){

    console.log("EDIT ERROR:",updateError);

    return;

}



    showComments();

}







// REPLY COMMENT

async function replyComment(commentId){

    let name = prompt("Your name:");

    let message = prompt("Your reply:");

    if(!name || !message){
        return;
    }


    const {data,error}=await client
    .from("replies")
.insert([
{
    comment_id: commentId,
    name:name,
    message:message,
    user_id:myUserId,
    likes:0,
    edited:false
}
])
    .select();


    console.log("REPLY ADDED:", data);
    console.log("REPLY ERROR:", error);


    if(error){
        alert(error.message);
        return;
    }


    showComments();

}



async function likeReply(id){

console.log("REPLY LIKE:", id);


const {data,error}=await client
.from("replies")
.select("likes")
.eq("id",id)
.single();


if(error){

console.log(error);
return;

}



let liked = likedReplies.includes(id);

let newLikes;



if(liked){

    // REMOVE LIKE

    newLikes = Math.max(
        (data.likes || 0) - 1,
        0
    );


    likedReplies = likedReplies.filter(
        item => item !== id
    );


}else{


    // ADD LIKE

    newLikes = (data.likes || 0) + 1;


    likedReplies.push(id);


}



localStorage.setItem(
    "likedReplies",
    JSON.stringify(likedReplies)
);



const {error:updateError}=await client
.from("replies")
.update({

likes:newLikes

})
.eq("id",id);



if(updateError){

console.log(updateError);
return;

}



showComments();


}



// LOAD REPLIES

async function loadReplies(commentId){


    const box=document.getElementById(
        "replies-"+commentId
    );


    const {data,error}=await client
.from("replies")
.select("*")
.eq("comment_id",commentId);


console.log("REPLIES FOUND:", data);

if(error){
    console.log("REPLY ERROR MESSAGE:", error.message);
    console.log("REPLY FULL ERROR:", error);
}


    if(error){

        console.log("REPLY LOAD ERROR:",error);

        box.innerHTML="Error loading replies";

        return;

    }



    box.innerHTML="";



    if(data.length==0){

        box.innerHTML="No replies yet";

        return;

    }



    data.forEach(reply=>{


        box.innerHTML += `

<div class="reply-box">

<h4>↳ ${reply.name}</h4>

<p>
${reply.message}
${reply.edited ? " • Edited" : ""}
</p>


<button onclick="likeReply(${reply.id})">

${likedReplies.includes(reply.id) ? "❤️" : "🤍"} 
${reply.likes ?? 0}

</button>


${
reply.user_id === myUserId ?

`

<button 
onclick='editReply(${reply.id}, ${JSON.stringify(reply.message)})'>
Edit
</button>


<button 
onclick="deleteReply(${reply.id})">
Delete
</button>

`

:""

}


</div>

`;


    });


}






async function toggleReplies(commentId){

    let box=document.getElementById(
        "replies-"+commentId
    );


    if(box.classList.contains("hidden")){


        box.classList.remove("hidden");


        setTimeout(()=>{

            box.classList.add("show");

        },10);


        await loadReplies(commentId);


    }else{


        box.classList.remove("show");


        setTimeout(()=>{

            box.classList.add("hidden");

        },300);


    }

}


async function countReplies(commentId){

    const {data,error} = await client
    .from("replies")
    .select("id")
    .eq("comment_id", commentId);


    if(error){
        console.log(error);
        return;
    }


    let button = document.getElementById(
        "reply-count-" + commentId
    );


    if(!button){
        return;
    }


    if(data.length === 0){

        button.innerHTML = " Reply";

    }else{

        button.innerHTML =
        "🔥 " + data.length + 
        (data.length === 1 ? " reply" : " replies");

    }

}

function timeAgo(date){

    let seconds = Math.floor(
        (new Date() - new Date(date)) / 1000
    );


    if(seconds < 60){
        return "Just now";
    }


    let minutes = Math.floor(seconds / 60);

    if(minutes < 60){
        return minutes + " minute" + 
        (minutes > 1 ? "s" : "") + " ago";
    }


    let hours = Math.floor(minutes / 60);

    if(hours < 24){
        return hours + " hour" +
        (hours > 1 ? "s" : "") + " ago";
    }


    let days = Math.floor(hours / 24);

    return days + " day" +
    (days > 1 ? "s" : "") + " ago";

}

function toggleMenu(id){

    let menu = document.getElementById(
        "menu-" + id
    );


    menu.classList.toggle("show-menu");

}



async function editReply(id,oldMessage){

const {data,error}=await client
.from("replies")
.select("*")
.eq("id",id)
.single();


if(error){
console.log(error);
return;
}


if(data.user_id !== myUserId){

alert("You can only edit your own reply");

return;

}



let newMessage=prompt(
"Edit reply:",
oldMessage
);


if(!newMessage)return;


await client
.from("replies")
.update({
message:newMessage,
edited:true,
edited_at:new Date()
})
.eq("id",id);


showComments();

}

async function deleteReply(id){


const {data,error}=await client
.from("replies")
.select("*")
.eq("id",id)
.single();



if(error){
console.log(error);
return;
}



if(data.user_id !== myUserId){

alert("You can only delete your own reply");

return;

}



let confirmDelete=confirm(
"Delete this reply?"
);



if(!confirmDelete)return;



await client
.from("replies")
.delete()
.eq("id",id);



showComments();


}


function enterWebsite(){

    document.getElementById("warningBox").style.display="none";

}


// REALTIME COMMENT NOTIFICATION

client
.channel("comments-channel")
.on(
    "postgres_changes",
    {
        event:"INSERT",
        schema:"public",
        table:"comments"
    },
    (payload)=>{

        console.log("New comment:", payload.new);


        showComments();


        notify(
"💬 New comment from " 
+ payload.new.name
);

    }
)
.subscribe();


function notify(text){

let box=document.getElementById("notification");

box.innerHTML=text;

box.style.display="block";


setTimeout(()=>{

box.style.display="none";

},3000);

}



// START WEBSITE

showComments();
