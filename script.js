const SUPABASE_URL = "https://tqnbacntxcdkugjalbos.supabase.co";

const SUPABASE_KEY = "sb_publishable_ZCkYFgmP95lqZas63nErgQ_MncUPeXV";


const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



// SHOW COMMENTS

async function showComments(){

    let box = document.getElementById("comments");

    box.innerHTML = "";


    let { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending:false });



    if(error){

        console.log(error);

        return;

    }



    data.forEach((c)=>{


        box.innerHTML += `

        <div class="comment-box">

            <h3>${c.name}</h3>

            <p>${c.message}</p>


        </div>

        `;


    });


}




// ADD COMMENT

async function addComment(){


    let name = document.getElementById("name").value;

    let message = document.getElementById("message").value;



    if(name.trim()=="" || message.trim()==""){

        alert("Please fill everything");

        return;

    }



    let { error } = await supabase
    .from("comments")
    .insert([

        {

            name:name,

            message:message

        }

    ]);




    if(error){

        console.log(error);

        alert("Error adding comment");

        return;

    }




    document.getElementById("name").value = "";

    document.getElementById("message").value = "";



    showComments();



}





// LOAD COMMENTS WHEN PAGE OPENS

showComments();


console.log("Script loaded");

showComments();
