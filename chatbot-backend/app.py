from flask import Flask,jsonify,request
from openai import OpenAI
import requests
import os
import time
from flask_cors import CORS
from dotenv import load_dotenv
# Load the .env file
load_dotenv()
# Set your OpenAI API key and assistant ID here
open_api_key=os.getenv("OPENAI_API_KEY")
my_assistant_id=os.getenv("ASSISTANT_KEY")
fmp_api_key=os.getenv("FMPAPIKEY")
agoda_com_key=os.getenv("AGODA_COM_KEY")
# Define OpenAI API endpoint and your API key
open_ai_chat_endpoint = "https://api.openai.com/v1/chat/completions"

app = Flask(__name__)
CORS(app)

def search_flights_agoda_com(origin, destination, date):
    url = "https://agoda-com.p.rapidapi.com/flights/search-one-way"
    querystring = {"origin": origin, "destination": destination, "departureDate": date}
    headers = {
        "x-rapidapi-key": agoda_com_key,
        "x-rapidapi-host": "agoda-com.p.rapidapi.com"
    }
    response = requests.get(url, headers=headers, params=querystring)
    try:
        # If the request was successful, proceed with processing the response
        response.raise_for_status()
        data=response.json()['data']['bundles']
        print("---------------------------------------")
        print(data)
        return str(data)
    except requests.exceptions.HTTPError as e:
    # Handle the HTTP error
        return f"HTTP error:{e}"
    except Exception as e:
        # Handle other possible errors (network issues, etc.)
        return f"Error:{e}"
    
def get_stock_price(symbol: str):
    api_url=f"https://financialmodelingprep.com/api/v3/quote-short/{symbol}?apikey={fmp_api_key}"
    response = requests.get(api_url)
    try:
        # If the request was successful, proceed with processing the response
        response.raise_for_status()
        data=response.json()
        return str(data[0]['price'])
    except requests.exceptions.HTTPError as e:
    # Handle the HTTP error
        return f"HTTP error:{e}"
    except Exception as e:
        # Handle other possible errors (network issues, etc.)
        return f"Error:{e}"

def get_weather(city: str):
    api_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={os.getenv('WEATHER_API_KEY')}"
    response = requests.get(api_url)
    try:
        # If the request was successful, proceed with processing the response
        response.raise_for_status()
        data=response.json()
        return {
            'temperature': f'{data['main']['temp']-273.15} Degrees Celsius',
            'weather': data['weather'][0]['description'],
            'city': data['name']
        }
    except requests.exceptions.HTTPError as e:
    # Handle the HTTP error
        return f"HTTP error:{e}"
    except Exception as e:
        # Handle other possible errors (network issues, etc.)
        return f"Error:{e}"

# Amadeus token retrieval
def get_amadeus_token():
    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "client_credentials",
        "client_id": os.getenv("AMADEUS_API_KEY"),
        "client_secret": os.getenv("AMADEUS_API_SECRET")
    }
    response = requests.post(url, headers=headers, data=data)
    return response.json().get("access_token")

# Search flights
def search_flights(origin, destination, date):
    token = get_amadeus_token()
    url = f"https://test.api.amadeus.com/v2/shopping/flight-offers"
    params = {
        "originLocationCode": origin,
        "destinationLocationCode": destination,
        "departureDate": date,
        "adults": "1",
        "nonStop": "true",
        "max": "5"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers, params=params)
    return response.json()

def load_openai_client_and_assistant():
    client=OpenAI(api_key=open_api_key)
    assistant=client.beta.assistants.retrieve(my_assistant_id)
    thread=client.beta.threads.create()
    return client,assistant,thread

client,my_assistant,my_assistant_thread = load_openai_client_and_assistant()

# check in loop  if assistant ai parse our request
def wait_on_run(run, thread):
    while run.status == "queued" or run.status == "in_progress":
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id,
        )
        time.sleep(0.5)
    return run

# initiate assistant ai response
def get_assistant_response(user_input=""):
    message = client.beta.threads.messages.create(
        thread_id=my_assistant_thread.id,
        role="user",
        content=user_input,
    )
    run = client.beta.threads.runs.create(
        thread_id=my_assistant_thread.id,
        assistant_id=my_assistant_id,
    )
    run = wait_on_run(run,my_assistant_thread)
    # Retrieve all the messages added after our last user message
    messages = client.beta.threads.messages.list(
        thread_id=my_assistant_thread.id, order="asc", after=message.id
    )
    return messages.data[0].content[0].text.value

@app.route("/")
def hello_world():
    return "Hello, world! The backend service is running."

@app.route("/stock/<string:symbol>")
def stock(symbol=""):
    api_url=f"https://financialmodelingprep.com/api/v3/quote-short/{symbol}?apikey={fmp_api_key}"
    response = requests.get(api_url)
    try:
        # If the request was successful, proceed with processing the response
        response.raise_for_status()
        data=response.json()
        return {
            'symbol': data[0]['symbol'],
            'price USD': data[0]['price'],
        }
    except Exception as e:
        # Handle other possible errors (network issues, etc.)
        return f"Error:{e}"

@app.route("/chat",methods=['POST'])
def completions():
    # Retrieve data from the incoming POST request
    # model = request.json['model']
    messages = request.json['messages']
    # Prepare headers with your API key
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {open_api_key}'
    }
    # Prepare payload for the OpenAI API request
    payload = {
        'model': 'gpt-3.5-turbo',
        'messages': messages
    }
    try:
        # # Make a POST request to the OpenAI endpoint
        response = requests.post(open_ai_chat_endpoint, json=payload, headers=headers)
        # # Parse the response as JSON
        response_data = response.json()
        # # Extract the completed chat message
        completion = response_data['choices'][0]['message']['content']
        # # Return the completion as a JSON response
        return jsonify(completion)
    except Exception as e:
        # Handle any errors that occur during the request
        return jsonify({'error': str(e)}), 500  


@app.route("/assistants",methods=['POST'])
def assistants():
    try:
        # Retrieve data from the incoming POST request
        # model = request.json['model']
        message = request.json['messages']['content']
        # return message
        result = get_assistant_response(message)
        return result,200
    except Exception as e:
        return {'message': 'Error!', 'error': str(e)}, 500
    
@app.route("/function",methods=['POST'])
def functions():
    try:
        input_message=request.json['messages']['content']
        # Step 2: Create a Thread
        thread = client.beta.threads.create()
        res_results=None

        # Step 3: Add a Message to a Thread
        message = client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=input_message
            # content=f"Can you please provide me stock price of {symbol}?"
        )

        # Step 4: Run the Assistant
        run = client.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=my_assistant_id,
            # instructions="Please address the user as Jack."
        )

        while True:
            # Wait for 2 seconds
            time.sleep(2)
            # Retrieve the run status
            run_status = client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )
            # If run is completed, get messages
            if run_status.status == 'completed':
                messages = client.beta.threads.messages.list(
                    thread_id=thread.id
                )
                res_results=messages.data[0].content[0].text.value
                break
            elif run_status.status == 'requires_action':
                required_actions = run_status.required_action.submit_tool_outputs.model_dump()
                tool_outputs = []
                import json
                for action in required_actions["tool_calls"]:
                    func_name = action['function']['name']
                    arguments = json.loads(action['function']['arguments'])
                    
                    if func_name == "get_weather":
                        output = get_weather(city=arguments['city'])
                        tool_outputs.append({
                            "tool_call_id": action['id'],
                            "output": str(output)
                        })
                    elif func_name == "search_flights":
                        output = search_flights_agoda_com(origin=arguments['origin'],destination=arguments['destination'],date=arguments['date'])
                        tool_outputs.append({
                            "tool_call_id": action['id'],
                            "output": str(output)
                        })
                    elif func_name == "get_stock_price":
                        output = get_stock_price(symbol=arguments['symbol'])
                        tool_outputs.append({
                            "tool_call_id": action['id'],
                            "output": str(output)
                        })
                    else:
                        raise ValueError(f"Unknown function: {func_name}")
                # print("-> Submitting outputs back to the Assistant...")
                client.beta.threads.runs.submit_tool_outputs(
                    thread_id=thread.id,
                    run_id=run.id,
                    tool_outputs=tool_outputs
                )
            else:
                # print(f"--->{'\033[93m'}Waiting for the assistant to process......")
                time.sleep(1)
        return res_results,200
    except Exception as e:
        return str(e),500

@app.route("/flights/amadeus",methods=['GET'])
def flight_amadeus():
    res=search_flights("PER","BNE","2024-08-25")
    return res

@app.route("/flights/agoda",methods=['GET'])
def flight_agoda():
    res=search_flights_agoda_com("PER","BNE","2024-08-25")
    return res

if __name__ == "__main__":
    app.run(debug=False)