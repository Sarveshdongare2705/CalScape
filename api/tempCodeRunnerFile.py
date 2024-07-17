from flask import Flask, request, jsonify

app = Flask(__name__)

# Define the suggestions for each category
suggestions = {
    "travel": [
        "Use public transportation like buses, trains, or subways instead of driving alone.",
        "Carpool or rideshare with others to reduce the number of vehicles on the road.",
        "Walk or bike for short distances rather than using a car.",
        "Opt for electric or hybrid vehicles to minimize fuel consumption and emissions.",
        "Reduce air travel by choosing direct flights whenever possible to lower carbon emissions.",
        "Use video conferencing tools instead of traveling for meetings to decrease your carbon footprint.",
        "Plan and combine errands to minimize the number of separate trips you need to make.",
        "Maintain your vehicle regularly for optimal fuel efficiency and lower emissions.",
        "Practice eco-friendly driving techniques such as gentle acceleration and maintaining steady speeds.",
        "Support and utilize car-sharing services to reduce the overall number of vehicles in use.",
        "Choose trains over flights for medium-distance travel to reduce your carbon footprint.",
        "Participate in bike-sharing programs to use bicycles for short trips instead of cars.",
        "Limit the use of taxis and ride-hailing services to reduce emissions from individual vehicle trips.",
        "Avoid idling your vehicle for long periods as it wastes fuel and contributes to air pollution.",
        "Encourage remote work or telecommuting to reduce daily commuting and associated emissions.",
        "Use energy-efficient appliances and lighting to conserve electricity and reduce carbon emissions.",
        "Install a programmable thermostat to optimize heating and cooling energy usage in your home.",
        "Insulate your home properly to reduce the need for heating and cooling, saving energy.",
        "Generate renewable energy at home by installing solar panels or using wind power where feasible.",
        "Reduce water usage by fixing leaks and installing water-efficient fixtures to save energy used for heating water.",
    ],
    "electricity": [
        "Switch to energy-efficient LED or CFL bulbs to lower electricity consumption for lighting.",
        "Turn off lights in unoccupied rooms and utilize natural light as much as possible.",
        "Unplug electronics and chargers when not in use to prevent 'phantom' energy usage.",
        "Use smart power strips to automatically cut off power to devices not in use.",
        "Install programmable thermostats to optimize heating and cooling energy usage.",
        "Upgrade to energy-efficient appliances with high Energy Star ratings to save electricity.",
        "Opt for renewable energy sources like solar or wind power to reduce reliance on fossil fuels.",
        "Insulate your home effectively to minimize heat loss in winter and keep cool in summer.",
        "Utilize natural lighting during the day to reduce the need for artificial lighting.",
        "Install motion sensors for outdoor lighting to activate lights only when needed.",
        "Set your computer and monitors to sleep mode or turn them off when inactive.",
        "Wash clothes in cold water to save energy used for heating water.",
        "Air-dry clothes on a drying rack or clothesline instead of using a dryer.",
        "Regularly maintain HVAC systems by cleaning filters and scheduling professional inspections.",
        "Reduce the use of space heaters and electric fans by optimizing home insulation and using them sparingly."
    ],
    "energy": [
        "Conduct a comprehensive energy audit of your home to pinpoint areas where energy efficiency improvements can be made.",
        "Install solar panels on your roof or property to harness renewable solar energy.",
        "Use a solar water heater system to heat water using the sun's energy.",
        "Seal leaks around windows and doors with weather stripping and caulking.",
        "Upgrade to double-glazed windows for better insulation and reduced heat transfer.",
        "Install energy-efficient insulation in walls, floors, and attics to minimize heat loss and improve overall thermal performance.",
        "Utilize a programmable thermostat to automatically adjust your home's temperature settings based on your daily schedule and preferences, optimizing energy usage.",
        "Lower the temperature setting on your water heater to around 120 degrees Fahrenheit (49 degrees Celsius) to save energy without sacrificing comfort.",
        "Implement energy-efficient landscaping strategies around your home, such as planting shade trees strategically to reduce the need for air conditioning in summer.",
        "Use ceiling fans to improve air circulation and distribute heated or cooled air more effectively throughout your living spaces, reducing reliance on HVAC systems.",
        "Replace outdated HVAC systems with modern, energy-efficient models that meet current efficiency standards and offer improved performance.",
        "Install low-flow showerheads and faucets to reduce water consumption and the energy required to heat water while maintaining adequate water pressure.",
        "Opt for cooking methods that use less energy, such as using a microwave, slow cooker, or pressure cooker instead of a conventional oven.",
        "Turn off the oven a few minutes before your food is fully cooked to take advantage of residual heat and complete the cooking process efficiently.",
        "Use induction cooktops, which are more energy-efficient than traditional stovetops, as they directly heat pots and pans using electromagnetic energy.",
    ],
    "food": [
        "Eat a plant-based diet to lower your carbon footprint.",
        "Reduce meat and dairy consumption.",
        "Buy locally-produced food to reduce carbon emissions associated with transportation.",
        "Grow your own vegetables and herbs to reduce reliance on store-bought produce.",
        "Avoid processed and packaged foods to minimize waste and reduce the environmental impact.",
        "Reduce food waste by planning meals, buying only what you need, and using leftovers creatively, ensuring that food resources are used efficiently.",
        "Compost food scraps to create nutrient-rich soil for your garden, divert organic waste from landfills, and reduce methane emissions associated with decomposing food.",
        "Use reusable bags, containers, and bottles to minimize single-use plastics and reduce the environmental impact of packaging waste.",
        "Choose organic and sustainably-produced foods to support farming practices that prioritize environmental health, biodiversity, and soil conservation.",
        "Reduce consumption of imported foods to lower the carbon emissions associated with long-distance transportation and support local agriculture.",
        "Support farmers' markets to buy fresh, seasonal produce directly from local farmers, reducing the environmental impact of food distribution and promoting community connections.",
        "Use energy-efficient cooking methods, such as pressure cookers, slow cookers, and microwaves, to save energy and reduce your carbon footprint in the kitchen.",
        "Preserve food through canning or drying to extend the shelf life of seasonal produce, reduce food waste, and enjoy local foods year-round.",
        "Avoid single-use plastic utensils and plates by using reusable alternatives, reducing plastic waste and the environmental impact of disposable products.",
        "Buy in bulk to reduce packaging waste, save money, and minimize the environmental impact of producing and disposing of individual packages."
    ],
    "clothes": [
        "Buy fewer, high-quality clothes that last longer.",
        "Choose sustainable and eco-friendly brands.",
        "Shop second-hand or vintage.",
        "Repair and mend clothes instead of discarding them.",
        "Host or participate in clothing swaps."
        "Wash clothes less frequently and in cold water to save energy and extend the life of your garments, reducing the environmental impact of laundering.",
        "Use a clothesline or drying rack instead of a dryer to air-dry your clothes, saving energy and lowering your carbon footprint.",
        "Donate clothes you no longer wear to charities or shelters, ensuring they are reused by others instead of ending up in landfills.",
        "Avoid fast fashion brands that prioritize cheap, disposable clothing, and instead invest in timeless pieces that will last for years.",
        "Choose natural fibers over synthetic ones to reduce the release of microplastics into the environment during washing and to support biodegradable materials.",
        "Use eco-friendly laundry detergents that are biodegradable and free from harmful chemicals, protecting water quality and reducing pollution.",
        "Avoid dry cleaning or choose eco-friendly dry cleaners that use less harmful solvents, reducing the environmental impact of garment care.",
        "Upcycle old clothes into new items, such as turning a worn-out shirt into a reusable bag, to creatively reduce waste and extend the life of materials.",
        "Store clothes properly to extend their lifespan by keeping them in a cool, dry place and using appropriate hangers or storage solutions.",
    ],
    "others": [
        "Reduce, reuse, and recycle materials.",
        "Use reusable shopping bags.",
        "Avoid single-use plastics.",
        "Use eco-friendly cleaning products.",
        "Install a rainwater harvesting system.",
        "Advocate for policies that protect the environment.",
        "Use digital documents instead of paper.",
        "Educate others about sustainability practices.",
        "Support eco-friendly businesses and products."
    ]
}


app_suggestions = {
    "Washing Machine": {
        "5 Star": {
            "Less than 5 years": {
                "Less than 5 kg": [
                    "Use the washing machine on full load for better efficiency.",
                    "Utilize eco-friendly detergents to enhance washing.",
                ],
                "5-7 kg": [
                    "Consider regular maintenance for optimal performance.",
                    "Schedule your wash during off-peak hours to save energy.",
                ],
                "More than 7 kg": [
                    "Check hoses for wear and replace if necessary.",
                    "Inspect for leaks and wear in hoses.",
                ],
            },
            "5-10 years": {
                "Less than 5 kg": [
                    "Clean the lint filter regularly to maintain performance.",
                    "Be cautious about overloads to maintain longevity.",
                ],
                "5-7 kg": [
                    "Consider upgrading to a more advanced model for improved efficiency.",
                    "Evaluate energy bills to assess efficiency.",
                ],
                "More than 7 kg": [
                    "Consider professional servicing for optimal performance.",
                    "Evaluate the cost-effectiveness of replacing versus repairing.",
                ],
            },
            "More than 10 years": {
                "Less than 5 kg": [
                    "Look into newer models that offer better energy ratings.",
                    "Check for any unusual noises indicating issues.",
                ],
                "5-7 kg": [
                    "Explore replacement options to save on energy costs.",
                    "Assess the condition of internal components regularly.",
                ],
                "More than 7 kg": [
                    "Monitor energy bills for signs of inefficiency.",
                    "Consider the cost of continued use vs. replacement.",
                ],
            },
        },
        "4 Star": {
            "Less than 5 years": {
                "Less than 5 kg": [
                    "Use the machine efficiently by washing full loads.",
                    "Select appropriate wash settings for fabric types.",
                ],
                "5-7 kg": [
                    "Perform regular maintenance checks to extend life.",
                    "Utilize eco-friendly detergents for better impact.",
                ],
                "More than 7 kg": [
                    "Inspect hoses for kinks and wear regularly.",
                    "Avoid overloading to maintain washing effectiveness.",
                ],
            },
            "5-10 years": {
                "Less than 5 kg": [
                    "Adjust wash cycles to save water and energy.",
                    "Monitor for any irregular sounds during operation.",
                ],
                "5-7 kg": [
                    "Evaluate the performance and consider upgrading.",
                    "Maintain the machine by cleaning filters regularly.",
                ],
                "More than 7 kg": [
                    "Consider professional evaluation for older models.",
                    "Assess ongoing costs vs. energy efficiency improvements.",
                ],
            },
            "More than 10 years": {
                "Less than 5 kg": [
                    "Check for warranty options on newer models.",
                    "Analyze repair costs against replacement costs.",
                ],
                "5-7 kg": [
                    "Consider energy-efficient upgrades for savings.",
                    "Look for signs of wear on internal components.",
                ],
                "More than 7 kg": [
                    "Evaluate energy consumption regularly.",
                    "Plan for a potential replacement based on age and efficiency.",
                ],
            },
        },
        "3 Star": {
            "Less than 5 years": {
                "Less than 5 kg": [
                    "Consider reducing wash frequency to save energy.",
                    "Regularly clean the detergent drawer for efficiency.",
                ],
                "5-7 kg": [
                    "Utilize shorter wash cycles when possible.",
                    "Maintain cleanliness to avoid buildup of residues.",
                ],
                "More than 7 kg": [
                    "Inspect for leaks to avoid water wastage.",
                    "Monitor performance closely for inefficiencies.",
                ],
            },
            "5-10 years": {
                "Less than 5 kg": [
                    "Use cold water settings to save energy.",
                    "Be cautious of overloads affecting washing quality.",
                ],
                "5-7 kg": [
                    "Consider purchasing a newer model for better efficiency.",
                    "Evaluate wash cycles based on load size.",
                ],
                "More than 7 kg": [
                    "Inspect hoses and connections regularly for wear.",
                    "Consider maintenance plans to prolong lifespan.",
                ],
            },
            "More than 10 years": {
                "Less than 5 kg": [
                    "Evaluate cost of repairs versus new models.",
                    "Check for any unusual leaks or noises.",
                ],
                "5-7 kg": [
                    "Monitor energy bills for spikes in usage.",
                    "Consider a more energy-efficient replacement.",
                ],
                "More than 7 kg": [
                    "Assess internal components for needed repairs.",
                    "Plan for eventual replacement based on performance.",
                ],
            },
        },  
    },
}

@app.route('/suggestions/<category>', methods=['GET'])
def get_suggestions(category):
    category = category.lower()
    if category in suggestions:
        return jsonify(suggestions[category])
    else:
        return jsonify({"error": "Category not found"}), 404

@app.route('/appliance_suggestions', methods=['POST'])
def get_appliance_suggestions():
    data = request.json
    appliance = data.get('appliance')
    age = data.get('age')
    capacity = data.get('capacity')
    rating = data.get('rating')

    if appliance not in app_suggestions:
        return jsonify({"error": "Appliance not found"}), 404

    # Get suggestions based on the age, capacity, and rating
    appliance_suggestions = app_suggestions[appliance].get(rating, {}).get(age, {}).get(capacity, [])
    
    return jsonify({"suggestions": appliance_suggestions})


if __name__ == '__main__':
    app.run(debug=True)
