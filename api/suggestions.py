from flask import Flask, request, jsonify

app = Flask(__name__)

def generate_suggestions(carbon_footprint, appliances, num_people):
    suggestions = []
    extra_data = []

    # General suggestions based on carbon footprint value
    if carbon_footprint > 8000:
        suggestions.extend([
            "Significantly reduce air travel and consider carbon offset programs.",
            "Switch to a fully renewable energy provider.",
            "Adopt a plant-based diet to reduce carbon emissions from food.",
            "Consider investing in an electric or hybrid vehicle.",
            "Use energy-efficient appliances and LED bulbs.",
            "Reduce heating and cooling usage through better insulation.",
            "Participate in local environmental initiatives and advocacy groups.",
            "Avoid fast fashion and opt for sustainable clothing brands.",
            "Install double-glazed windows to improve home insulation.",
            "Minimize waste by composting organic matter."
        ])
        extra_data.append({"category": "Energy", "tip": "Switch to renewable energy sources like solar or wind power."})
        extra_data.append({"category": "Transportation", "tip": "Use public transportation or carpool to reduce emissions."})
    elif carbon_footprint > 5000:
        suggestions.extend([
            "Reduce air travel and choose more sustainable airlines.",
            "Use public transport or carpool more frequently.",
            "Install solar panels on your home.",
            "Conduct an energy audit of your home and implement recommendations.",
            "Implement a recycling program at home.",
            "Switch to a low-flow showerhead to save water.",
            "Consider installing a green roof to improve insulation and air quality.",
            "Switch to energy-efficient lighting like LEDs.",
            "Participate in tree planting activities.",
            "Opt for second-hand or refurbished products."
        ])
        extra_data.append({"category": "Water", "tip": "Install low-flow fixtures to conserve water."})
        extra_data.append({"category": "Waste", "tip": "Reduce, reuse, and recycle to minimize waste."})
    elif carbon_footprint > 3000:
        suggestions.extend([
            "Use energy-efficient appliances and light bulbs.",
            "Switch to renewable energy sources such as wind or solar power.",
            "Reduce meat consumption and opt for more plant-based meals.",
            "Optimize your heating and cooling systems for better efficiency.",
            "Use reusable bags, bottles, and containers.",
            "Install a smart thermostat to manage energy usage.",
            "Plant trees around your home to provide natural shade.",
            "Use public transportation instead of personal vehicles.",
            "Buy local produce to reduce food miles.",
            "Support businesses with sustainable practices."
        ])
        extra_data.append({"category": "Diet", "tip": "Adopt a plant-based diet to significantly lower your carbon footprint."})
        extra_data.append({"category": "Shopping", "tip": "Choose products with minimal packaging."})
    elif carbon_footprint > 800:
        suggestions.extend([
            "Be mindful of your water usage and fix any leaks promptly.",
            "Reduce, reuse, and recycle materials to minimize waste.",
            "Use a programmable thermostat to control heating and cooling.",
            "Reduce the use of single-use plastics and opt for reusable products.",
            "Compost kitchen waste to reduce landfill contribution.",
            "Use a clothesline or drying rack instead of a dryer.",
            "Choose energy-efficient transportation options like biking or walking.",
            "Perform regular maintenance on your vehicle to ensure optimal efficiency.",
            "Engage in community-based environmental projects.",
            "Support local farmers' markets and sustainable agriculture."
        ])
        extra_data.append({"category": "Home", "tip": "Install weather stripping to improve home insulation."})
        extra_data.append({"category": "Lifestyle", "tip": "Participate in community clean-up events to promote sustainability."})
    else:
        suggestions.extend([
            "Maintain energy-efficient habits such as turning off lights when not in use.",
            "Walk or bike for short trips instead of driving.",
            "Continue using eco-friendly products and sustainable practices.",
            "Join a local environmental group to stay informed and active.",
            "Participate in community clean-up events.",
            "Support businesses that prioritize sustainability.",
            "Share your knowledge about sustainability with others.",
            "Limit the use of heating and air conditioning.",
            "Use natural light during the day instead of electric lights.",
            "Donate or recycle old electronics responsibly."
        ])
        extra_data.append({"category": "Habits", "tip": "Turn off appliances and electronics when not in use to save energy."})
        extra_data.append({"category": "Community", "tip": "Join local environmental groups to stay active in sustainability efforts."})

    return suggestions, extra_data

def generate_appliance_suggestions(appliance, additional_input):    
    suggestions = []
    if appliance == "fridge":
        age = additional_input
        if age:
            if age > 10:
                suggestions.append("Consider replacing your old fridge with an energy-efficient model.")
            if age > 5:
                suggestions.append("Have your fridge inspected for efficiency.")
        suggestions.extend([
            "Ensure the fridge door seals are in good condition to maintain efficiency.",
            "Set the fridge temperature to 3-4°C and freezer to -18°C for optimal performance.",
            "Clean the condenser coils at least twice a year.",
            "Avoid placing hot food directly into the fridge.",
            "Allow space around the fridge for proper air circulation.",
            "Keep the fridge relatively full for better temperature regulation.",
            "Check and replace the water filter regularly if your fridge has one.",
            "Use storage containers to organize and minimize the time the door is open.",
            "Thaw frozen food in the fridge to assist cooling.",
            "Avoid overfilling the fridge to maintain airflow.",
            "Don't keep the fridge door open for too long.",
            "Use a thermometer to check and adjust the temperature settings.",
            "Cover food to prevent moisture loss and excess work for the fridge.",
            "Regularly defrost the freezer to maintain efficiency.",
            "Place the fridge away from heat sources like ovens or direct sunlight.",
            "Consider using a fridge thermometer to monitor internal temperatures.",
            "Use energy-saving mode if available.",
            "Organize contents for easy access to frequently used items.",
            "Plan your fridge layout to minimize door openings."
        ])
    elif appliance == "air_conditioner":
        area = additional_input
        if area:
            if area > 1500:
                suggestions.append("Consider using a central AC system for large areas.")
            if area < 500:
                suggestions.append("A portable or window AC unit might be more efficient for small areas.")
        suggestions.extend([
            "Use ceiling fans to help circulate cool air and reduce the load on the AC.",
            "Clean or replace the AC filters regularly.",
            "Keep doors and windows closed when the AC is on.",
            "Use curtains or blinds to block out direct sunlight.",
            "Seal any leaks in ducts or windows to prevent cool air from escaping.",
            "Install a programmable thermostat to manage cooling efficiently.",
            "Shade your outdoor AC unit to improve efficiency.",
            "Ensure the AC unit is properly sized for your space.",
            "Schedule regular maintenance checks for optimal performance.",
            "Set the thermostat to 24-26°C for a balance of comfort and efficiency.",
            "Use energy-efficient models with high SEER ratings.",
            "Avoid using heat-producing appliances during the hottest part of the day.",
            "Place the thermostat away from heat sources for accurate readings.",
            "Use zone cooling to target specific areas instead of cooling the entire home.",
            "Keep the outdoor unit free of debris and obstructions.",
            "Upgrade to a smart thermostat for better control and energy savings.",
            "Ensure proper insulation in your home to reduce cooling needs.",
            "Close off unused rooms to concentrate cooling where needed.",
            "Run ceiling fans in reverse to pull cool air up and distribute it.",
            "Consider using energy-efficient windows to reduce heat gain."
        ])
    elif appliance == "washing_machine":
        frequency = additional_input
        if frequency:
            if frequency > 7:
                suggestions.append("Opt for full loads to maximize water and energy use efficiency.")
            if frequency < 3:
                suggestions.append("Use a high-efficiency washer for smaller, frequent loads.")
        suggestions.extend([
            "Use cold water for most washes to save energy.",
            "Use the correct amount of detergent to avoid buildup.",
            "Clean the washing machine regularly to prevent mold and mildew.",
            "Use the high-speed spin cycle to reduce drying time.",
            "Avoid overloading the machine to maintain efficiency.",
            "Use the shortest wash cycle that will get your clothes clean.",
            "Consider using a front-loading washer for better efficiency.",
            "Run maintenance cycles as recommended by the manufacturer.",
            "Check hoses and connections for leaks regularly.",
            "Use a mesh bag for small items to prevent them from getting lost.",
            "Consider air drying clothes when possible to save energy.",
            "Use a water softener if you have hard water to improve cleaning efficiency.",
            "Separate heavy and light items for more effective washing.",
            "Pre-treat stains to avoid the need for extra washes.",
            "Keep the washing machine door open after use to allow it to dry out.",
            "Choose an energy-efficient model with a high MEF rating.",
            "Upgrade to a washer with smart technology for better control and efficiency.",
            "Use laundry balls or other tools to reduce detergent use.",
            "Select the appropriate wash cycle for different types of fabrics.",
            "Install a lint trap on the drain hose to prevent clogs."
        ])
    elif appliance == "oven":
        usage = additional_input
        if usage:
            if usage > 4:
                suggestions.append("Consider using a microwave or toaster oven for smaller meals to save energy.")
            if usage < 2:
                suggestions.append("Preheat the oven only when necessary to save energy.")
        suggestions.extend([
            "Avoid opening the oven door frequently while cooking to retain heat.",
            "Use glass or ceramic dishes, which retain heat better.",
            "Cook multiple dishes at once to maximize energy use.",
            "Turn off the oven a few minutes before the food is done and let residual heat finish the cooking.",
            "Use the self-cleaning feature sparingly, as it uses a lot of energy.",
            "Keep the oven clean to maintain efficient operation.",
            "Check the oven seal for any leaks or damage.",
            "Use the convection setting if available for faster, more even cooking.",
            "Preheat the oven for the shortest time necessary.",
            "Use a thermometer to ensure accurate cooking temperatures.",
            "Plan meals to minimize the number of times you need to use the oven.",
            "Consider using an oven with a split cavity for cooking different dishes at different temperatures.",
            "Keep the oven door glass clean for easy monitoring without opening the door.",
            "Use the correct rack position for optimal cooking results.",
            "Allow frozen foods to thaw before cooking to reduce cooking time.",
            "Turn off the oven light when not needed to save energy.",
            "Ensure proper ventilation in the kitchen to reduce cooling needs.",
            "Bake during cooler parts of the day to avoid heating up your home.",
            "Use baking stones to maintain even heat distribution.",
            "Check the oven's energy rating when considering a new purchase."
        ])
    elif appliance == "geyser":
        temperature = additional_input
        if temperature:
            if temperature > 60:
                suggestions.append("Lower the geyser temperature to 50-60°C to save energy.")
            if temperature < 40:
                suggestions.append("Increase the temperature to ensure water is hot enough for use.")
        suggestions.extend([
            "Use a timer to heat water only when needed.",
            "Install an insulating blanket on the geyser to reduce heat loss.",
            "Consider using a solar water heater to reduce energy consumption.",
            "Check for leaks and repair them promptly to prevent water waste.",
            "Use low-flow showerheads to reduce hot water usage.",
            "Install heat traps on the water pipes to prevent heat loss.",
            "Regularly drain and flush the geyser to remove sediment buildup.",
            "Upgrade to an energy-efficient model with better insulation.",
            "Use point-of-use water heaters for areas with low hot water demand.",
            "Reduce the duration of showers to save hot water.",
            "Install a mixing valve to maintain consistent water temperature.",
            "Insulate hot water pipes to minimize heat loss.",
            "Schedule regular maintenance checks for optimal performance.",
            "Consider using a tankless water heater for on-demand hot water.",
            "Use a water heater timer to control heating periods.",
            "Check the anode rod periodically and replace it if necessary.",
            "Set the thermostat to the lowest comfortable setting.",
            "Use cold water for tasks like washing hands and brushing teeth.",
            "Avoid running hot water appliances simultaneously to reduce strain on the system.",
            "Install a recirculation pump to reduce water waste."
        ])
    elif appliance == "dishwasher":
        frequency = additional_input
        if frequency:
            if frequency > 7:
                suggestions.append("Run the dishwasher only when fully loaded to save water and energy.")
            if frequency < 3:
                suggestions.append("Use the dishwasher's half-load setting if available.")
        suggestions.extend([
            "Use the eco mode if available to save energy and water.",
            "Avoid pre-rinsing dishes to save water.",
            "Use the air-dry setting instead of heat-dry to save energy.",
            "Clean the dishwasher filter regularly for optimal performance.",
            "Check and repair any leaks promptly."])
    elif appliance == "electric_heater":
        area = additional_input
        if area:
            if area > 1500:
                suggestions.append("Consider using centralized heating or alternative heating sources like heat pumps.")
        suggestions.append("Use space heaters in small areas instead of heating the whole house.")
    
    return suggestions

@app.route('/')
def home():
    return "Welcome to the Carbon Footprint Suggestion API. Use the /suggest and /appliance-suggest endpoints to get suggestions."

@app.route('/suggest', methods=['POST'])
def suggest():
    data = request.json
    carbon_footprint = data.get('carbon_footprint', 0)
    appliances = data.get('appliances', [])
    num_people = data.get('num_people', 1)
    
    if not isinstance(carbon_footprint, (int, float)) or carbon_footprint < 0:
        return jsonify({"error": "Invalid carbon footprint value"}), 400
    
    if not isinstance(appliances, list):
        return jsonify({"error": "Invalid appliances list"}), 400
    
    if not isinstance(num_people, int) or num_people <= 0:
        return jsonify({"error": "Invalid number of people"}), 400
    
    suggestions, extra_data = generate_suggestions(carbon_footprint, appliances, num_people)
    
    return jsonify({"suggestions": suggestions, "extra_data": extra_data})

@app.route('/appliance-suggest', methods=['POST'])
def appliance_suggest():
    data = request.json
    appliance = data.get('appliance')
    additional_input = data.get('additional_input', 0)

    if not appliance:
        return jsonify({"error": "No appliance specified"}), 400
    
    suggestions = generate_appliance_suggestions(appliance, additional_input)
    
    return jsonify({"suggestions": suggestions})

if __name__ == '__main__':
    app.run(debug=True)
