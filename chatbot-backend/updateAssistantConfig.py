from openai import OpenAI
import os
from dotenv import load_dotenv
# Load the .env file
load_dotenv()
# Set your OpenAI API key and assistant ID here
open_api_key=os.getenv("OPENAI_API_KEY")
my_assistant_id=os.getenv("ASSISTANT_ID")
files_vs=os.getenv("FILES_VS")

# Initialize the client
client = OpenAI(api_key=open_api_key)

tools_list = [
    {   
        "type": "file_search"
    },
    {
        "type": "function",
        "function": {
            "name": "get_stock_price",
            "description": "Retrieve the latest closing price of a stock using its ticker symbol",
            "parameters": {
                "type": "object",
                "properties": {
                    "symbol": {
                        "type": "string",
                        "description": "The ticker symbol of the stock"
                    }
                },
                "required": ["symbol"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Fetch weather information for a given city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "City name"
                    }
                },
                "required": ["city"]
            }
        }
    },
        {
        "type": "function",
        "function": {
            "name": "search_flights",
            "description": "search flights information between 2 given cities",
            "parameters": {
                "type": "object",
                "properties": {
                    "origin": {
                        "type": "string",
                        "description": "departure city iataCode, like: PER represents Perth"
                    },
                    "destination": {
                        "type": "string",
                        "description": "arrival city iataCode, like: BNE represents Brisbane"
                    },
                    "date": {
                        "type": "string",
                        "description": "departure date, date formate: 2024-07-25"
                    }
                },
                "required": ["origin","destination","date"]
            }
        }
    }
]

# Update the Assistant configuration
assistant = client.beta.assistants.update(
    assistant_id=my_assistant_id,
    name="Talent Assistant",
    instructions="""
    You are an assistant capable of searching flights as requested, searching weather of a city as requested, searching the stock price of a company in NASDAQ as requested, providing product lists and prices in the Shopping Market, and summarizing and refining papers.
    (1)When assisting flight search, please assume users are from Australia, and display flight prices in Australian dollars. Please search flights for next week from the current local time, if no specific dates were provided by the users. In addition to the searched flights, please also give users advice using information from the internet and your own knowledge.
    (2)When assisting stock search, get a simple quote for a stock, including the price, change, and volume.
    (3)When assisting the weather of a city, such as temperature and weather condition.
    (4)When assisting customers for the Shopping Market, you can obtain product lists and prices from the provided menu source file.
    (5)When demonstrating your capability of assisting paper reading and writing,  you can use the provided paper in the source files as an example.
    """,
    tools=tools_list,
    model="gpt-3.5-turbo",
    tool_resources={"file_search": {"vector_store_ids": [files_vs]}},
)