console.log("MY SCRIPT FILE LOADED");

const SUPABASE_URL = "https://tqnbacntxcdkugjalbos.supabase.co";

const SUPABASE_KEY = "sb_publishable_ZCkYFgmP95lqZas63nErgQ_MncUPeXV";


const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



console.log("Supabase connected");



// LOAD COMMENTS

async function showComments(){

    const box = document.getElementById("comments");

    box.innerHTML = "Loading comments...";


    const {data, error} = await client
    .from("comments")
    .select("*")
    .order("created_at", {ascending:false});



    if(error){

        console.log(error);

        box.innerHTML = "Failed to load comments";

        return;

    }

    console.log("COMMENTS:", data);

 
    box.innerHTML = "";



    data.forEach(comment => {


        box.innerHTML += `

        <div class="comment-box">


            <h3>${comment.name}</h3>


            <p>${comment.message}</p>



            <div class="reactions">


            <button onclick="likeComment(${comment.id}, ${comment.likes || 0})">

            ❤️ ${comment.likes || 0}

            </button>



            <button onclick="editComment(${comment.id}, '${comment.message}')">

            ✏️ Edit

            </button>



            <button onclick="deleteComment(${comment.id})">

            🗑 Delete

            </button>


            </div>


        </div>


        `;


    });


}





// ADD COMMENT


async function addComment(){

    console.log("ADD COMMENT CLICKED");


    let name = document.getElementById("name").value;
    let message = document.getElementById("message").value;


    if(name.trim()=="" || message.trim()==""){
        alert("Please fill everything");
        return;
    }


    const {data, error} = await client
    .from("comments")
    .insert([
        {
            name:name,
            message:message
        }
    ])
    .select();


    console.log("DATA:", data);
    console.log("ERROR:", error);


    if(error){
        alert("Error posting comment");
        return;
    }


    document.getElementById("name").value="";
    document.getElementById("message").value="";


    showComments();

}










// DELETE COMMENT


async function deleteComment(id){


    await client
    .from("comments")
    .delete()
    .eq("id",id);



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








// LIKE COMMENT


async function likeComment(id,currentLikes){


    await client
    .from("comments")
    .update({

        likes: currentLikes + 1

    })

    .eq("id",id);



    showComments();


}







// START


showComments();
