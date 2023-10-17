const setupTextarea = document.getElementById('setup-textarea');
const setuploading = document.getElementById('loading-container');
const setupInputContainer = document.getElementById('setup-input-container');
const movieBossText = document.getElementById('movie-boss-text');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


const url = "https://api.openai.com/v1/completions";
const url1 = 'https://api.openai.com/v1/images/generations'

$(window).on('load', function() {
  $("#loading-container").css('display', 'block');
});

document.getElementById("send-btn").addEventListener("click", () => {
  var userInput = $("#setup-textarea").val();
  $("#loading-container").css('display', 'none');
  movieBossText.innerText = "Ok, just wait a second while my digital brain digests that...";
  document.getElementById("output-container").style.display = 'block';
  fetchBotReply(userInput);
  fetchSynopsis(userInput);
});

async function fetchBotReply(userInput) {
  try {
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        'model': 'text-davinci-003',
        'prompt': `Generate a short message to enthusiastically say that an outline sounds interesting and that you need some minutes to find a book about it.
        
    ###
    outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
    message: I'll spend a few moments searching for that. But I love your idea!! A disaster movie in the jungle!
    ###
    outline: A group of corrupt lawyers try to send an innocent woman to jail.
    message: Wow, that is awesome! Corrupt lawyers, huh? Give me a few moments to search!
    ###
    outline: ${userInput}
    message: 
    `,
        'max_tokens': 50, // Replace with your desired value
        'temperature': 0.8 // Replace with your desired value
      })
    });

    const data = await response.json();
    console.log(data.choices[0].text);
    setTimeout(function() {
      $("#loading-container").css('display', 'block');
      movieBossText.innerText = data.choices[0].text.trim();

    }, 1000);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchSynopsis(outline) {
  try {
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        'model': 'text-davinci-003',
        'prompt': `Find a real book based on outline.The synopsis should include the author and title followed by a short summary of the book.
        ###
        outline: fantasy, adventure and magic.
        synopsis: In Brandon Sanderson's "Mistborn: The Final Empire," a world oppressed by the immortal tyrant, the Lord Ruler, sets the stage for a thrilling fantasy adventure. Vin, a young thief with Allomantic powers to manipulate metals, joins the charismatic Kelsier's rebellion to overthrow the oppressive Final Empire. As secrets unravel and dangers mount, Vin's journey becomes a daring battle for freedom, love, and sacrifice. Immerse yourself in this enthralling tale of magic, adventure, and resilience that will leave you spellbound.
        ###
        outline: romance and politics
        synopsis: In "American Wife," Curtis Sittenfeld presents a riveting tale of love and politics through the life of Alice Blackwell, the First Lady of the United States. Inspired by the experiences of former First Lady Laura Bush, the novel delves into Alice's journey from a reserved librarian to the wife of a charismatic and ambitious politician, Charlie Blackwell. Their whirlwind romance leads to marriage and eventually to Charlie's presidency. Throughout the story, Sittenfeld masterfully navigates the complex interplay between Alice's personal desires, political responsibilities, and her role as a devoted wife. The novel poignantly examines the sacrifices, struggles, and inner conflicts faced by Alice as she grapples with her own identity amidst the demands of public life. "American Wife" is a captivating exploration of the human heart, showcasing the challenges and dilemmas encountered when love and politics intertwine, leaving readers to ponder the power and vulnerability of one woman's heart in the realm of high-stakes politics.
        ###
        outline: love and war
        synopsis: Ernest Hemingway's "A Farewell to Arms" is a poignant novel set during World War I, exploring the intertwining themes of love and war. The story follows Frederic Henry, an American ambulance driver serving in the Italian army. Amidst the brutality of war, he meets Catherine Barkley, an English nurse, and their chance encounter blossoms into a passionate love affair. As the war rages on, Hemingway delves into the emotional complexities of their relationship and the toll of combat on the human psyche. Against the backdrop of senseless violence, the couple seeks solace in each other, navigating the harsh realities of war and the fragility of life. With Hemingway's signature prose, "A Farewell to Arms" is a timeless exploration of the human spirit's resilience amidst the trials of love and the horrors of war, leaving readers with a profound meditation on the complexities of the human experience.
        ###
        outline: ${outline}
        synopsis: 
        `
        ,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const synopsis = data.choices[0].text.trim();
    document.getElementById('output-text').innerText = synopsis;
    fetchTitle(synopsis);


  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchTitle(synopsis) {
  try {
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        'model': 'text-davinci-003',
        'prompt': `Find the title in this synopsis:\n\n${synopsis}`,
        'max_tokens': 25,
        'temperature': 0.1
      })
    });

    const data = await response.json();
    const title = data.choices[0].text.trim();
    document.getElementById('output-title').innerText = title;
    fetchAuthor(title);
    fetchImagePrompt(title);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchAuthor(title) {
  try {
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        'model': 'text-davinci-003',
        'prompt': `
          Find the author's name of the title.
          ###
          title: ${title}
          names:   
        `,
        'max_tokens': 25
      })
    });

    const data = await response.json();
    const extractedText = data.choices[0].text.trim();
    const starNames = extractedText.replace('names:', '').trim();
    document.getElementById('output-stars').innerText = starNames;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchImagePrompt(title) {
  try {
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        'model': 'text-davinci-003',
        'prompt': `Depict a scene which occurs in the book titled ${title} in.
        ###

        title: American Wife
        image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is superimposed over the scene.
        ###

        title: The Quantum Paradox: A Tale of Time, Reality, and Parallel Universes
        image description: Greg Heffley tries to impress his crush, Holly Hills, by attempting a daring skateboard trick, but it hilariously goes awry, leaving him with a tumble and a red face.
        ###
        title: To Kill a Mockingbird
        image description: On a sweltering summer day, Jem and Scout find shiny treasures in the knothole of an old oak tree near the mysterious Radley house. Curious about the gifts and the enigmatic Boo Radley, they begin to ponder the hidden goodness in unexpected places.
        ###
        title: ${title}
        image description: 
        `,
        temperature: 0.8,
        max_tokens: 200
      })
    });

    const data = await response.json();
    const imagePrompt = data.choices[0].text.trim();
    fetchImageUrl(imagePrompt);
   //movieBossText.innerText = imagePrompt;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchImageUrl(imagePrompt){
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      prompt:`${imagePrompt}. There should be no text in this image.`,
      n: 1,
      size: '512x512',
      response_format: 'b64_json'
    })
  };
  fetch(url1, requestOptions)
  .then(response => response.json())
  .then(data => {
    //const imageData = data.data[0].b64_json;
    if (data.data && data.data.length > 0) {
      document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${data.data[0].b64_json}">`;
    }
    setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
    document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  })
  })
}

// Helper function to handle fetch and rate limits
async function fetchAPI(url, options) {
  const response = await fetch(url, options);
  if (response.status === 429) {
    // Handle rate limit by waiting and retrying the request after a delay
    const retryAfter = parseInt(response.headers.get('Retry-After')) || 1;
    await sleep(retryAfter * 2000);
    return fetchAPI(url, options); // Retry the request
  }
  return response;
}

// Helper function to introduce delay using setTimeout
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

