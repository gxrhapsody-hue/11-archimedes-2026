console.log("MY SCRIPT FILE LOADED");


const SUPABASE_URL = "https://tqnbacntxcdkugjalbos.supabase.co";

const SUPABASE_KEY = "sb_publishable_ZCkYFgmP95lqZas63nErgQ_MncUPeXV";


const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


console.log("Supabase connected");




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

            <h3>${comment.name}</h3>

            <p>${comment.message}</p>


            <button onclick="replyComment(${comment.id})">
               Reply
            </button>


            <div id="replies-${comment.id}">
            Loading replies...
            </div>


            <div class="reactions">


            <button onclick="likeComment(${comment.id}, ${comment.likes || 0})">
               ${comment.likes || 0}
            </button>


            <button onclick="editComment(${comment.id}, '${comment.message}')">
               Edit
            </button>


            <button onclick="deleteComment(${comment.id})">
               Delete
            </button>


            </div>


        </div>

        `;


        await loadReplies(comment.id);

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

            likes:0

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

async function likeComment(id,currentLikes){



    const {error}=await client
    .from("comments")
    .update({

        likes: currentLikes + 1

    })

    .eq("id",id);



    if(error){

        console.log("LIKE ERROR:",error);

        return;

    }



    showComments();


}








// DELETE COMMENT

async function deleteComment(id){


    const {error}=await client
    .from("comments")
    .delete()
    .eq("id",id);



    if(error){

        console.log(error);

        return;

    }


    showComments();


}







// EDIT COMMENT

async function editComment(id,oldMessage){


    let newMessage = prompt(
        "Edit your comment:",
        oldMessage
    );


    if(newMessage==null || newMessage.trim()==""){

        return;

    }



    await client
    .from("comments")
    .update({

        message:newMessage

    })

    .eq("id",id);



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
            name: name,
            message: message
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
console.log("REPLY ERROR:", error);



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

        <p>${reply.message}</p>


        </div>

        `;


    });


}







// START WEBSITE

showComments();
