import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {colors} from '../Colors';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import BottomNavigation from '../components/BottomNavigation';
import {ActivityIndicator} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

const Survey = () => {
  const route = useRoute();
  const {uid, Route} = route.params;
  console.log(uid);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSucess] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      setShowSucess(false);
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 5000);
      return () => clearTimeout(timer);
    }, []),
  );

  //basicDetails calculation
  const housingEmissionFactors = {
    Independent: 0.208,
    'Apartment(Flat)': 0.15,
    Bungalow: 0.275,
    'Semi-Detached': 0.175,
    Terraced: 0.1833,
  };
  const cityEmissionFactors = {
    Vishakhapatnam: 2.1,
    Vijayawada: 2.2,
    Guntur: 2.0,
    Nellore: 1.9,
    Kurnool: 1.8,
    Tirupati: 2.3,
    Rajahmundry: 2.1,
    Kadapa: 1.7,
    Kakinada: 2.0,
    Anantapur: 1.8,
    Vizianagaram: 1.6,
    Eluru: 1.9,
    Ongole: 1.7,
    Chittoor: 1.8,
    Tenali: 1.6,
    Itanagar: 1.2,
    Tawang: 1.1,
    Ziro: 1.0,
    Pasighat: 1.1,
    Bomdila: 1.0,
    Naharlagun: 1.2,
    Roing: 1.1,
    Tezu: 1.0,
    Aalo: 1.0,
    Seppa: 1.0,
    Guwahati: 2.4,
    Jorhat: 2.2,
    Silchar: 2.1,
    Dibrugarh: 2.2,
    Tezpur: 2.0,
    Nagaon: 1.9,
    Tinsukia: 2.1,
    Sivasagar: 1.9,
    Goalpara: 1.7,
    Karimganj: 1.8,
    Patna: 2.5,
    Gaya: 2.2,
    Bhagalpur: 2.1,
    Muzaffarpur: 2.0,
    Purnea: 1.9,
    Darbhanga: 2.0,
    'Bihar Sharif': 1.9,
    Ara: 1.8,
    Begusarai: 1.7,
    Katihar: 1.8,
    Raipur: 2.5,
    Bilaspur: 2.3,
    Durg: 2.2,
    Bhilai: 2.4,
    Korba: 2.3,
    Rajnandgaon: 2.0,
    Jagdalpur: 1.9,
    Raigarh: 1.8,
    Ambikapur: 1.7,
    Dhamtari: 1.6,
    Panaji: 1.8,
    Margao: 1.7,
    'Vasco da Gama': 1.9,
    Mapusa: 1.7,
    Ponda: 1.6,
    Bicholim: 1.5,
    Curchorem: 1.5,
    Canacona: 1.4,
    Valpoi: 1.4,
    Sanguem: 1.3,
    Ahmedabad: 2.8,
    Surat: 2.7,
    Vadodara: 2.6,
    Rajkot: 2.5,
    Bhavnagar: 2.3,
    Jamnagar: 2.4,
    Junagadh: 2.2,
    Gandhinagar: 2.5,
    Gandhidham: 2.2,
    Anand: 2.1,
    Chandigarh: 2.3,
    Faridabad: 2.4,
    Gurugram: 2.5,
    Panipat: 2.2,
    Ambala: 2.1,
    Yamunanagar: 2.0,
    Rohtak: 2.1,
    Hisar: 2.0,
    Karnal: 2.1,
    Sonipat: 2.1,
    Shimla: 1.5,
    Manali: 1.4,
    Dharamshala: 1.3,
    Mandi: 1.2,
    Solan: 1.3,
    Kullu: 1.2,
    Bilaspur: 1.1,
    Chamba: 1.0,
    Hamirpur: 1.0,
    Nahan: 1.0,
    Ranchi: 2.3,
    Jamshedpur: 2.4,
    Dhanbad: 2.2,
    Bokaro: 2.2,
    Deoghar: 2.0,
    Hazaribagh: 2.0,
    Giridih: 1.9,
    Ramgarh: 1.8,
    Palamu: 1.7,
    Phusro: 1.6,
    Bengaluru: 3.0,
    Mysore: 2.5,
    Hubli: 2.4,
    Mangalore: 2.6,
    Belgaum: 2.4,
    Gulbarga: 2.3,
    Davangere: 2.2,
    Bellary: 2.2,
    Bijapur: 2.1,
    Shimoga: 2.0,
    Thiruvananthapuram: 2.1,
    Kochi: 2.4,
    Kozhikode: 2.2,
    Kollam: 2.1,
    Thrissur: 2.0,
    Alappuzha: 2.0,
    Palakkad: 1.9,
    Malappuram: 1.9,
    Kottayam: 1.8,
    Kannur: 1.8,
    Bhopal: 2.6,
    Indore: 2.8,
    Gwalior: 2.4,
    Jabalpur: 2.4,
    Ujjain: 2.3,
    Sagar: 2.1,
    Ratlam: 2.0,
    Rewa: 1.9,
    Satna: 1.9,
    Dewas: 1.8,
    Mumbai: 3.5,
    Pune: 3.0,
    Nagpur: 2.8,
    Nashik: 2.7,
    Aurangabad: 2.6,
    Solapur: 2.5,
    Amravati: 2.4,
    Kolhapur: 2.3,
    Malegaon: 2.2,
    Akola: 2.1,
    Imphal: 1.6,
    Bishnupur: 1.5,
    Churachandpur: 1.4,
    Thoubal: 1.4,
    Kakching: 1.3,
    Ukhrul: 1.2,
    Senapati: 1.2,
    Tamenglong: 1.1,
    Jiribam: 1.1,
    Moirang: 1.0,
    Shillong: 1.7,
    Tura: 1.6,
    Jowai: 1.5,
    Nongpoh: 1.4,
    Baghmara: 1.3,
    Nongstoin: 1.3,
    Williamnagar: 1.2,
    Resubelpara: 1.1,
    Mairang: 1.1,
    Ampati: 1.0,
    Aizawl: 1.6,
    Lunglei: 1.5,
    Saiha: 1.4,
    Champhai: 1.4,
    Kolasib: 1.3,
    Serchhip: 1.2,
    Mamit: 1.2,
    Lawngtlai: 1.1,
    Bairabi: 1.1,
    'North Vanlaiphai': 1.0,
    Kohima: 1.5,
    Dimapur: 1.5,
    Mokokchung: 1.4,
    Wokha: 1.3,
    Zunheboto: 1.3,
    Tuensang: 1.2,
    Mon: 1.2,
    Phek: 1.1,
    Kiphire: 1.1,
    Longleng: 1.0,
    Bhubaneswar: 2.4,
    Cuttack: 2.3,
    Rourkela: 2.2,
    Puri: 2.1,
    Sambalpur: 2.1,
    Balasore: 2.0,
    Bhadrak: 1.9,
    Baripada: 1.8,
    Berhampur: 1.8,
    Angul: 1.7,
    Ludhiana: 2.5,
    Amritsar: 2.4,
    Jalandhar: 2.3,
    Patiala: 2.2,
    Bathinda: 2.1,
    Hoshiarpur: 2.0,
    Mohali: 2.1,
    Pathankot: 1.9,
    Batala: 1.8,
    Jaipur: 2.6,
    Jodhpur: 2.5,
    Udaipur: 2.4,
    Kota: 2.3,
    Ajmer: 2.2,
    Bikaner: 2.1,
    Bhilwara: 2.0,
    Alwar: 2.0,
    Bharatpur: 1.9,
    Pali: 1.8,
    Gangtok: 1.5,
    Namchi: 1.4,
    Geyzing: 1.3,
    Mangan: 1.3,
    Rongpo: 1.2,
    Singtam: 1.2,
    Yuksom: 1.1,
    Pelling: 1.1,
    Lachung: 1.0,
    Ravangla: 1.0,
    Chennai: 2.9,
    Coimbatore: 2.8,
    Madurai: 2.7,
    Tiruchirappalli: 2.6,
    Salem: 2.5,
    Tirunelveli: 2.4,
    Tiruppur: 2.3,
    Vellore: 2.2,
    Erode: 2.1,
    Thoothukudi: 2.0,
    Hyderabad: 3.1,
    Warangal: 2.6,
    Nizamabad: 2.4,
    Khammam: 2.3,
    Karimnagar: 2.2,
    Ramagundam: 2.1,
    Mahbubnagar: 2.0,
    Nalgonda: 1.9,
    Adilabad: 1.8,
    Siddipet: 1.8,
    Agartala: 2.0,
    Udaipur: 1.9,
    Dharmanagar: 1.8,
    Kailashahar: 1.7,
    Belonia: 1.6,
    Ambassa: 1.5,
    Khowai: 1.5,
    Melaghar: 1.4,
    Sonamura: 1.3,
    Bishalgarh: 1.2,
    Lucknow: 3.0,
    Kanpur: 2.9,
    Ghaziabad: 2.8,
    Agra: 2.7,
    Varanasi: 2.6,
    Meerut: 2.5,
    Allahabad: 2.4,
    Bareilly: 2.3,
    Aligarh: 2.2,
    Moradabad: 2.1,
    Dehradun: 2.1,
    Haridwar: 2.0,
    Roorkee: 1.9,
    Haldwani: 1.8,
    Rishikesh: 1.7,
    Rudrapur: 1.6,
    Kashipur: 1.5,
    Ramnagar: 1.4,
    Nainital: 1.4,
    Pithoragarh: 1.3,
    Kolkata: 3.0,
    Howrah: 2.9,
    Durgapur: 2.8,
    Siliguri: 2.7,
    Asansol: 2.6,
    Malda: 2.5,
    Kharagpur: 2.4,
    Bardhaman: 2.3,
    Jalpaiguri: 2.2,
    Darjeeling: 2.1,
  };
  const calculateBasicDetails = async (uid, basicDetails) => {
    const {
      age,
      familyMembers,
      belowTenMembers,
      city,
      state,
      country,
      typeOfHouse,
      houseSize,
      income,
    } = basicDetails;

    const housingFactor = housingEmissionFactors[typeOfHouse];
    const cityFactor = cityEmissionFactors[city];

    const averageHouseSize = houseSize;

    const footprintValue = housingFactor * averageHouseSize * cityFactor;

    console.log(footprintValue);

    const updateTime = new Date();
    const timestamp = {
      hour: updateTime.getHours(),
      minute: updateTime.getMinutes(),
      date: updateTime.getDate(),
      month: updateTime.getMonth() + 1,
      year: updateTime.getFullYear(),
    };

    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    const footprintData = {
      basicDetails: footprintValue,
      timestamp,
    };
    try {
      await footprintRef.set(footprintData);
      console.log('Basic details successfully stored.');
    } catch (err) {
      console.error('Error storing footprint data:', err);
    }
  };

  //recycle details calculation
  const calculateRecycleDetails = async (uid, recycleDetails) => {
    const {
      cansRecycle,
      plasticRecycle,
      glassRecycle,
      newspapersRecycle,
      booksRecycle,
    } = recycleDetails;

    const cansFactor = 0.5; // Example factor for aluminum and steel cans
    const plasticFactor = 0.3; // Example factor for plastic
    const glassFactor = 0.2; // Example factor for glass
    const newspapersFactor = 0.1; // Example factor for newspapers
    const booksFactor = 0.15; // Example factor for books/magazines

    const footprintValue =
      (cansRecycle === 'Yes' ? cansFactor : 0) +
      (plasticRecycle === 'Yes' ? plasticFactor : 0) +
      (glassRecycle === 'Yes' ? glassFactor : 0) +
      (newspapersRecycle === 'Yes' ? newspapersFactor : 0) +
      (booksRecycle === 'Yes' ? booksFactor : 0);

    const updateTime = new Date();
    const timestamp = {
      hour: updateTime.getHours(),
      minute: updateTime.getMinutes(),
      date: updateTime.getDate(),
      month: updateTime.getMonth() + 1,
      year: updateTime.getFullYear(),
    };

    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    const footprintData = {
      recycleDetails: footprintValue,
      timestamp,
    };

    try {
      await footprintRef.update(footprintData);
      console.log('Recycle details successfully stored.');
    } catch (err) {
      console.error('Error storing recycle details:', err);
    }
  };

  const travelEmissionFactors = {
    petrolCar: 0.17,
    deiselCar: 0.171,
    electricCar: 0.047,
    naturalGasCar: 0.13,
    petrolTruck: 0.249,
    dieselTruck: 0.279,
    electricTruck: 0.13,
    naturalGasTruck: 0.2,
    petrolBike: 0.114,
    electricBike: 0.032,
    hybridBike: 0.073,
    bicycle: 0.012,
    airTravelEconomic: 0.346,
    airTravelBusiness: 0.647,
    airTravelFirstClass: 0.781,
    railTravel: 0.035,
    busTravel: 0.097,
    taxiTravel: 0.179,
    waterwaysTravel: 0.019,
  };
  const calculateTravelDetails = async (uid, data) => {
    let footprint = 0;

    // Calculate for bicycles
    if (data.bicycleCount !== 0) {
      footprint +=
        data.bicycleDetails.bicycleDistance * travelEmissionFactors.bicycle;
    }

    // Calculate for bikes
    if (data.bikeCount !== 0) {
      if (data.bikeDetails.petrolBikeDistance) {
        footprint +=
          data.bikeDetails.petrolBikeDistance *
          travelEmissionFactors.petrolBike;
      }
      if (data.bikeDetails.electricBikeDistance) {
        footprint +=
          data.bikeDetails.electricBikeDistance *
          travelEmissionFactors.electricBike;
      }
      if (data.bikeDetails.hybridBikeDistance) {
        footprint +=
          data.bikeDetails.hybridBikeDistance *
          travelEmissionFactors.hybridBike;
      }
    }

    // Calculate for cars
    if (data.carCount !== 0) {
      if (data.carDetails.deiselCarDistance) {
        footprint +=
          data.carDetails.deiselCarDistance * travelEmissionFactors.deiselCar;
      }
      if (data.carDetails.electricCarDistance) {
        footprint +=
          data.carDetails.electricCarDistance *
          travelEmissionFactors.electricCar;
      }
      if (data.carDetails.naturalGasCarDistance) {
        footprint +=
          data.carDetails.naturalGasCarDistance *
          travelEmissionFactors.naturalGasCar;
      }
      if (data.carDetails.petrolCarDistance) {
        footprint +=
          (data.carDetails.petrolCarDistance /
            data.carDetails.petrolCarMileage) *
          travelEmissionFactors.petrolCar;
      }
    }

    // Calculate for large vehicles
    if (data.largeVehicleCount !== 0) {
      if (data.largeVehicleDetails.deiselLvDistance) {
        footprint +=
          data.largeVehicleDetails.deiselLvDistance *
          travelEmissionFactors.dieselTruck;
      }
      if (data.largeVehicleDetails.electricLvDistance) {
        footprint +=
          data.largeVehicleDetails.electricLvDistance *
          travelEmissionFactors.electricTruck;
      }
      if (data.largeVehicleDetails.naturalGasLvDistance) {
        footprint +=
          data.largeVehicleDetails.naturalGasLvDistance *
          travelEmissionFactors.naturalGasTruck;
      }
      if (data.largeVehicleDetails.petrolLvDistance) {
        footprint +=
          (data.largeVehicleDetails.petrolLvDistance /
            data.largeVehicleDetails.petrolLvMileage) *
          travelEmissionFactors.petrolTruck;
      }
    }

    // Calculate for public transport
    footprint +=
      data.publicTransport.busDistance * travelEmissionFactors.busTravel;
    footprint +=
      data.publicTransport.trainDistance * travelEmissionFactors.railTravel;
    footprint +=
      data.publicTransport.taxiDistance * travelEmissionFactors.taxiTravel;
    footprint +=
      data.publicTransport.waterwaysDistance *
      travelEmissionFactors.waterwaysTravel;

    // Calculate for flights based on flight type
    const flightEmissionFactor =
      data.publicTransport.flightType === 'economic'
        ? travelEmissionFactors.airTravelEconomic
        : data.publicTransport.flightType === 'business'
        ? travelEmissionFactors.airTravelBusiness
        : travelEmissionFactors.airTravelFirstClass;
    footprint += data.publicTransport.flightDistance * flightEmissionFactor;

    // Store footprint data in Firestore
    const updateTime = new Date();
    const timestamp = {
      hour: updateTime.getHours(),
      minute: updateTime.getMinutes(),
      date: updateTime.getDate(),
      month: updateTime.getMonth() + 1,
      year: updateTime.getFullYear(),
    };

    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    const footprintData = {
      travelDetails: footprint,
      timestamp,
    };

    try {
      await footprintRef.update(footprintData);
      console.log('Travel details successfully stored.');
    } catch (err) {
      console.error('Error storing travel details:', err);
    }
  };

  const calculateElectricityDetails = async (uid, electricityDetails) => {
    const electricityEmissionFactors = {
      thermal: 0.95,
      nuclear: 0.02,
      wind: 0.01,
      hydroelectric: 0.02,
      solar: 0.05,
      gridMix: 0.93,
    };

    const electricityType = electricityDetails.electricityType || 'gridMix';
    const electricityUnits = electricityDetails.electricityUnits || 0;
    const electricityEmissionFactor =
      electricityEmissionFactors[electricityType] ||
      electricityEmissionFactors['gridMix'];

    const totalElectricityEmissions =
      electricityUnits * electricityEmissionFactor;

    const totalFootprintValue = totalElectricityEmissions;

    const updateTime = new Date();
    const timestamp = {
      hour: updateTime.getHours(),
      minute: updateTime.getMinutes(),
      date: updateTime.getDate(),
      month: updateTime.getMonth() + 1,
      year: updateTime.getFullYear(),
    };

    // Firestore reference to store footprint data
    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    // Data to store in Firestore
    const footprintData = {
      electricityDetails: totalFootprintValue,
      timestamp,
    };

    try {
      // Save footprint data in Firestore
      await footprintRef.update(footprintData);
      console.log('Electricity details successfully stored.');
    } catch (err) {
      console.error('Error storing electricity details:', err);
    }
  };

  //energy details
  const calculateEnergyDetails = async (uid, energyDetails) => {
    const coalQuantity = energyDetails.coalQuantity || 0;
    const keroseneUnits = energyDetails.keroseneUnits || 0;
    const lpgUnits = energyDetails.lpgUnits || 0;
    const pngUnits = energyDetails.pngUnits || 0;
    const woodQuantity = energyDetails.woodQuantity || 0;

    // Conversion factors (example values, adjust as per your emission data)
    const coalEmissionFactor = 3.5;
    const keroseneEmissionFactor = 2.0;
    const lpgEmissionFactor = 3.0;
    const pngEmissionFactor = 2.75;
    const woodEmissionFactor = 0.7;

    // Calculate emissions from each source
    const totalCoalEmissions = coalQuantity * coalEmissionFactor;
    const totalKeroseneEmissions = keroseneUnits * keroseneEmissionFactor;
    const totalLpgEmissions = lpgUnits * 15 * lpgEmissionFactor;
    const totalPngEmissions = pngUnits * pngEmissionFactor;
    const totalWoodEmissions = woodQuantity * woodEmissionFactor;

    // Total footprint value
    const totalFootprintValue =
      totalCoalEmissions +
      totalKeroseneEmissions +
      totalLpgEmissions +
      totalPngEmissions +
      totalWoodEmissions;

    // Timestamp for database entry
    const updateTime = new Date();
    const timestamp = {
      hour: updateTime.getHours(),
      minute: updateTime.getMinutes(),
      date: updateTime.getDate(),
      month: updateTime.getMonth() + 1,
      year: updateTime.getFullYear(),
    };

    // Firestore reference to store footprint data
    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    // Data to store in Firestore
    const footprintData = {
      energyDetails: totalFootprintValue,
      timestamp,
    };

    try {
      // Save footprint data in Firestore
      await footprintRef.update(footprintData);
      console.log('Energy details successfully stored.');
    } catch (err) {
      console.error('Error storing energy details:', err);
    }
  };

  //food details
  const calculateFoodDetails = async (uid, foodDetails) => {
    // Emission factors in kg CO2e per unit of consumption, adjusted for monthly values
    const emissionFactors = {
      animalBased: {
        Daily: 5.0 * 30, // Daily impact scaled to a month
        Weekly: 1.2 * 4, // Weekly impact scaled to a month
        Monthly: 0.3, // Monthly impact
        Never: 0, // No impact
      },
      foodOrder: {
        Daily: 4.0 * 30, // Daily impact scaled to a month
        Weekly: 1.0 * 4, // Weekly impact scaled to a month
        Monthly: 0.2, // Monthly impact
        Quarterly: 0.1 / 3, // Quarterly impact scaled to a month
        Occasionally: 0.05, // Occasional impact (assumed as monthly)
      },
      localOrganic: 0.5, // per percentage point, assumed monthly
      packagedImported: 2.0, // per percentage point, assumed monthly
      fruitsVegetables: 0.3, // per percentage point, assumed monthly
      grainsCereal: 0.4, // per percentage point, assumed monthly
      processedFoods: 1.5, // per percentage point, assumed monthly
      dairyMilkProducts: 1.8, // per percentage point, assumed monthly
      animalBasedFood: 2.5, // per percentage point, assumed monthly
    };

    // Destructure the food details
    const {
      animalBasedFrequency,
      foodOrderFrequency,
      localOrganicPercentage,
      packagedImportedPercentage,
      fruitsVegetablesPercentage,
      grainsCerealPercentage,
      processedFoodsPercentage,
      dairyMilkProductsPercentage,
      animalBasedFoodPercentage,
    } = foodDetails;

    // Calculate total emissions based on the provided data and emission factors
    const totalFoodEmissions =
      (emissionFactors.animalBased[animalBasedFrequency] || 0) +
      (emissionFactors.foodOrder[foodOrderFrequency] || 0) +
      localOrganicPercentage * emissionFactors.localOrganic +
      packagedImportedPercentage * emissionFactors.packagedImported +
      fruitsVegetablesPercentage * emissionFactors.fruitsVegetables +
      grainsCerealPercentage * emissionFactors.grainsCereal +
      processedFoodsPercentage * emissionFactors.processedFoods +
      dairyMilkProductsPercentage * emissionFactors.dairyMilkProducts +
      animalBasedFoodPercentage * emissionFactors.animalBasedFood;

    // Get current timestamp
    const updateTime = new Date();
    const timestamp = {
      hour: updateTime.getHours(),
      minute: updateTime.getMinutes(),
      date: updateTime.getDate(),
      month: updateTime.getMonth() + 1,
      year: updateTime.getFullYear(),
    };

    // Firestore reference to store footprint data
    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    // Data to store in Firestore
    const footprintData = {
      foodDetails: totalFoodEmissions,
      timestamp,
    };

    try {
      // Save footprint data in Firestore
      await footprintRef.update(footprintData);
      console.log('Food details successfully stored.');
    } catch (err) {
      console.error('Error storing food details:', err);
    }
  };

  //clothing details
  const calculateClothingDetails = async (uid, clothingDetails) => {
    // Emission factors in kg CO2e per month
    const emissionFactors = {
      clothingFrequency: {
        '0-5': 8,
        '5-10': 15,
        '10-20': 20,
        '20 or more': 40,
      },
      recycleRate: {
        '100%': 0,
        '75%': 3,
        '50%': 5,
        '25%': 6,
        '0%': 9,
      },
      washingMethod: {
        'Washing Machine': 3.3,
        'Traditional Practices': 3.7,
        Both: 3.5,
        'Community Laundromat': 3.1,
      },
      mostUsedMaterial: {
        Cotton: 2,
        Silk: 3,
        Wool: 2.5,
        Nylon: 4,
        Polyester: 3.5,
        Linen: 1.5,
        Synthetic: 4,
      },
    };

    // Destructure the clothing details
    const {clothingFrequency, recycleRate, washingMethod, mostUsedMaterial} =
      clothingDetails;

    // Calculate total emissions based on the provided data and emission factors
    const totalClothingEmissions =
      (emissionFactors.clothingFrequency[clothingFrequency] || 0) +
      (emissionFactors.recycleRate[recycleRate] || 0) +
      (emissionFactors.washingMethod[washingMethod] || 0) +
      (emissionFactors.mostUsedMaterial[mostUsedMaterial] || 0);

    // Get current timestamp
    const updateTime = new Date();
    const timestamp = {
      hour: updateTime.getHours(),
      minute: updateTime.getMinutes(),
      date: updateTime.getDate(),
      month: updateTime.getMonth() + 1,
      year: updateTime.getFullYear(),
    };

    // Firestore reference to store footprint data
    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    // Data to store in Firestore
    const footprintData = {
      clothingDetails: totalClothingEmissions,
      timestamp,
    };

    try {
      // Save footprint data in Firestore
      await footprintRef.update(footprintData);
      console.log('Clothing details successfully stored.');
    } catch (err) {
      console.error('Error storing clothing details:', err);
    }
  };

  const calculateExtraDetails = async (uid, extraDetails) => {
    // Emission factors for different activities in kg CO2 per unit
    const EMISSION_FACTORS = {
      saplings: -21.77 / 12, // in kg CO2 per sapling per month
      vacation: {
        Car: 0.21, // in kg CO2 per km
        Train: 0.041, // in kg CO2 per km
        Bus: 0.104, // in kg CO2 per km
        Plane: 0.133, // in kg CO2 per km
        Other: 0.15, // in kg CO2 per km, assuming an average
      },
      accommodation: {
        Hotel: 31, // in kg CO2 per night
        Resort: 42, // in kg CO2 per night
        Airbnb: 14, // in kg CO2 per night
        Camping: 2, // in kg CO2 per night
        Other: 20, // in kg CO2 per night, assuming an average
      },
      distance: {
        '0-100 km': 50, // average distance for this range
        '100-500 km': 300,
        '500-1000 km': 750,
        '1000+ km': 1500,
      },
    };

    // Destructure the extra details
    const {
      saplingsCount,
      vacationsCount,
      transportationMode,
      distance,
      accommodationDetails,
    } = extraDetails;

    // Calculate total emissions based on the provided data and emission factors
    let footprint = 0;

    // Calculate footprint reduction from planting saplings (monthly)
    footprint += saplingsCount * EMISSION_FACTORS.saplings;

    // Calculate footprint from vacations (monthly)
    const distanceKm = EMISSION_FACTORS.distance[distance];
    const vacationTransportationEmission =
      distanceKm * EMISSION_FACTORS.vacation[transportationMode];
    const vacationAccommodationEmission =
      EMISSION_FACTORS.accommodation[accommodationDetails];

    // Assume average vacation duration is 7 days and distribute over the year
    const vacationDuration = 7;
    const totalVacationEmission =
      vacationTransportationEmission +
      vacationDuration * vacationAccommodationEmission;
    const monthlyVacationEmission =
      (vacationsCount * totalVacationEmission) / 12;

    footprint += monthlyVacationEmission;

    // Get current timestamp
    const updateTime = new Date();
    const timestamp = {
      hour: updateTime.getHours(),
      minute: updateTime.getMinutes(),
      date: updateTime.getDate(),
      month: updateTime.getMonth() + 1,
      year: updateTime.getFullYear(),
    };

    // Firestore reference to store footprint data
    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    // Data to store in Firestore
    const footprintData = {
      extraDetails: footprint,
      timestamp,
    };

    try {
      // Save footprint data in Firestore
      await footprintRef.update(footprintData);
      console.log('Extra details successfully stored.');
    } catch (err) {
      console.error('Error storing extra details:', err);
    }
  };

  const fetchAndUpdateFootprint = async () => {
    setUploading(true);
    //basic details
    const basicDetailsRef = firestore()
      .collection('UserData')
      .doc(uid)
      .collection('BasicDetails')
      .doc(`basic_details:${uid}`);
    const doc1 = await basicDetailsRef.get();
    if (doc1.exists) {
      const data = doc1.data();
      calculateBasicDetails(uid, data);
    }

    //recycle details
    const recycleDetailsRef = firestore()
      .collection('UserData')
      .doc(uid)
      .collection('RecycleDetails')
      .doc(`recycle_details:${uid}`);
    const doc2 = await recycleDetailsRef.get();
    if (doc2.exists) {
      const data = doc2.data();
      calculateRecycleDetails(uid, data);
    }

    //travel details
    const travelDetailsRef = firestore()
      .collection('UserData')
      .doc(uid)
      .collection('TravelDetails')
      .doc(`travel_details:${uid}`);
    const doc3 = await travelDetailsRef.get();
    if (doc3.exists) {
      const data = doc3.data();
      calculateTravelDetails(uid, data);
    }

    //electricity details
    const electricityDetailsRef = firestore()
      .collection('UserData')
      .doc(uid)
      .collection('ElectricityDetails')
      .doc(`electricity_details:${uid}`);
    const doc4 = await electricityDetailsRef.get();
    if (doc4.exists) {
      const data = doc4.data();
      calculateElectricityDetails(uid, data);
    }

    //energy details
    const energyDetailsRef = firestore()
      .collection('UserData')
      .doc(uid)
      .collection('EnergyDetails')
      .doc(`energy_details:${uid}`);
    const doc5 = await energyDetailsRef.get();
    if (doc5.exists) {
      const data = doc5.data();
      calculateEnergyDetails(uid, data);
    }

    //food details
    const foodDetailsRef = firestore()
      .collection('UserData')
      .doc(uid)
      .collection('FoodDetails')
      .doc(`food_details:${uid}`);
    const doc6 = await foodDetailsRef.get();
    if (doc6.exists) {
      const data = doc6.data();
      calculateFoodDetails(uid, data);
    }

    //clothing details
    const clothingDetailsRef = firestore()
      .collection('UserData')
      .doc(uid)
      .collection('ClothingDetails')
      .doc(`clothing_details:${uid}`);
    const doc7 = await clothingDetailsRef.get();
    if (doc7.exists) {
      const data = doc7.data();
      calculateClothingDetails(uid, data);
    }

    //extra details
    const extraDetailsRef = firestore()
      .collection('UserData')
      .doc(uid)
      .collection('ExtraDetails')
      .doc(`extra_details:${uid}`);
    const doc8 = await extraDetailsRef.get();
    if (doc8.exists) {
      const data = doc8.data();
      calculateExtraDetails(uid, data);
    }
    setUploading(false);
    setShowSucess(true);
  };

  if (loading && Route === 'Home') {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          gap: 10,
        }}>
        <ActivityIndicator color="black" size={24} />
        <Text style={{color: 'black', fontFamily: colors.font4, fontSize: 14}}>
          Loading Survey
        </Text>
        <View style={{position: 'absolute', bottom: 0, left: 5, right: 5}}>
          <BottomNavigation />
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {showSuccess && (
          <View
            style={[
              styles.msg,
              {backgroundColor: colors.successGreen, zIndex: 999},
            ]}>
            <Text style={styles.msgtxt}>{`Footrprint value is updated`}</Text>
            <TouchableOpacity onPress={() => setShowSucess(false)}>
              <Image
                source={require('../assets/cross.png')}
                style={{width: 22, height: 22}}
              />
            </TouchableOpacity>
          </View>
        )}
        {!showSuccess && (
          <View style={{position: 'absolute', zIndex: 999, top: 12, left: 12}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../assets/backButton.png')}
                style={{width: 27, height: 27}}
              />
            </TouchableOpacity>
          </View>
        )}
        <View style={{width: '100%', height: 250}}>
          <Image
            source={require('../assets/update2.png')}
            style={{
              width: '100%',
              height: 200,
              objectFit: 'contain',
              marginBottom: 0,
            }}
          />
          <View style={styles.section1}>
            <View style={{width: '100%', alignItems: 'center'}}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 22,
                  textAlign: 'center',
                  fontFamily: colors.font2,
                }}>
                Update Your Data
              </Text>
              <Text
                style={{
                  color: 'gray',
                  fontSize: 14,
                  textAlign: 'center',
                  fontFamily: colors.font4,
                  width: '90%',
                }}>
                Update your details to calculate your latest carbon footprint
                accurately.
              </Text>
            </View>
          </View>
        </View>
        <View style={[{width: '100%', padding: 12, marginTop: 20}]}>
          <ScrollView style={{width: '100%', height: '49%'}}>
            <TouchableOpacity
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                borderRadius: 15,
                borderColor: 'gray',
                borderWidth: 0.4,
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
              onPress={() =>
                navigation.navigate('Questionnaire', {
                  uid: uid,
                  from: 'survey',
                })
              }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 15,
                  width: '96%',
                }}>
                <Image
                  source={require('../assets/homeDetails.png')}
                  style={{width: 36, height: 36}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 17,
                    fontFamily: colors.font4,
                  }}>
                  Basic Details
                </Text>
              </View>
              <Image
                source={require('../assets/forward.png')}
                style={{width: 20, height: 20, marginTop: 3}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                borderRadius: 15,
                borderColor: 'gray',
                borderWidth: 0.4,
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
              onPress={() =>
                navigation.navigate('Travel', {
                  uid: uid,
                  from: 'survey',
                })
              }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 15,
                  width: '96%',
                }}>
                <Image
                  source={require('../assets/bicycle.png')}
                  style={{width: 36, height: 36}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 17,
                    fontFamily: colors.font4,
                  }}>
                  Travel Details
                </Text>
              </View>
              <Image
                source={require('../assets/forward.png')}
                style={{width: 20, height: 20, marginTop: 3}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                borderRadius: 15,
                borderColor: 'gray',
                borderWidth: 0.4,
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
              onPress={() =>
                navigation.navigate('Electricity', {
                  uid: uid,
                  from: 'survey',
                })
              }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 15,
                  width: '96%',
                }}>
                <Image
                  source={require('../assets/ev.png')}
                  style={{width: 36, height: 36}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 17,
                    fontFamily: colors.font4,
                  }}>
                  Electricity Details
                </Text>
              </View>
              <Image
                source={require('../assets/forward.png')}
                style={{width: 20, height: 20, marginTop: 3}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                borderRadius: 15,
                borderColor: 'gray',
                borderWidth: 0.4,
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
              onPress={() =>
                navigation.navigate('Energy', {
                  uid: uid,
                  from: 'survey',
                })
              }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 15,
                  width: '96%',
                }}>
                <Image
                  source={require('../assets/lpg.png')}
                  style={{width: 36, height: 36}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 17,
                    fontFamily: colors.font4,
                  }}>
                  Fuel Energy Details
                </Text>
              </View>
              <Image
                source={require('../assets/forward.png')}
                style={{width: 20, height: 20, marginTop: 3}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                borderRadius: 15,
                borderColor: 'gray',
                borderWidth: 0.4,
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
              onPress={() =>
                navigation.navigate('Food', {
                  uid: uid,
                  from: 'survey',
                })
              }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 15,
                  width: '96%',
                }}>
                <Image
                  source={require('../assets/foodIcon.png')}
                  style={{width: 36, height: 36}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 17,
                    fontFamily: colors.font4,
                  }}>
                  Diet Details
                </Text>
              </View>
              <Image
                source={require('../assets/forward.png')}
                style={{width: 20, height: 20, marginTop: 3}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                borderRadius: 15,
                borderColor: 'gray',
                borderWidth: 0.4,
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
              onPress={() =>
                navigation.navigate('Clothes', {
                  uid: uid,
                  from: 'survey',
                })
              }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 15,
                  width: '96%',
                }}>
                <Image
                  source={require('../assets/clothes.png')}
                  style={{width: 36, height: 36}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 17,
                    fontFamily: colors.font4,
                  }}>
                  Clothing and Shopping
                </Text>
              </View>
              <Image
                source={require('../assets/forward.png')}
                style={{width: 20, height: 20, marginTop: 3}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                borderRadius: 15,
                borderColor: 'gray',
                borderWidth: 0.4,
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
              onPress={() =>
                navigation.navigate('Recycle', {
                  uid: uid,
                  from: 'survey',
                })
              }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 15,
                  width: '96%',
                }}>
                <Image
                  source={require('../assets/waste.png')}
                  style={{width: 36, height: 36}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 17,
                    fontFamily: colors.font4,
                  }}>
                  Waste Management
                </Text>
              </View>
              <Image
                source={require('../assets/forward.png')}
                style={{width: 20, height: 20, marginTop: 3}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                borderRadius: 15,
                borderColor: 'gray',
                borderWidth: 0.4,
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
              onPress={() =>
                navigation.navigate('ExtraActivities', {
                  uid: uid,
                  from: 'survey',
                })
              }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 15,
                  width: '96%',
                }}>
                <Image
                  source={require('../assets/extra5.png')}
                  style={{width: 36, height: 36}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 17,
                    fontFamily: colors.font4,
                  }}>
                  Extra Activities
                </Text>
              </View>
              <Image
                source={require('../assets/forward.png')}
                style={{width: 20, height: 20, marginTop: 3}}
              />
            </TouchableOpacity>
            <View style={{width: '100%', height: 600}}></View>
          </ScrollView>
        </View>
        <View
          style={{
            alignItems: 'center',
            position: 'absolute',
            bottom: 60,
            zIndex: 999,
            width: '100%',
          }}>
          {uploading ? (
            <TouchableOpacity
              style={styles.btn}
              onPress={fetchAndUpdateFootprint}>
              <ActivityIndicator size={'small'} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.btn}
              onPress={fetchAndUpdateFootprint}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontFamily: colors.font2,
                }}>
                Update Footprint
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{position: 'absolute', bottom: 0, left: 5, right: 5}}>
          <BottomNavigation />
        </View>
      </View>
    );
  }
};
export default Survey;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    flexDirection: 'column',
  },
  section: {
    width: '100%',
    displat: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
  icon: {
    width: 30,
    height: 30,
    objectFit: 'contain',
  },
  button: {
    width: 140,
    height: 140,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 5,
    marginRight: 10,
    shadowColor: 'gray',
    shadowOffset: {width: 2, height: 20},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    backgroundColor: colors.bg,
    borderRadius: 12,
    marginLeft: 5,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  text: {
    color: 'black',
    height: 30,
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: colors.font2,
    opacity: 0.3,
  },
  image: {
    width: 110,
    height: 90,
  },
  section1: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  btn: {
    width: '70%',
    backgroundColor: '#78C8CC',
    height: 40,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  msg: {
    color: 'white',
    width: '98%',
    height: 40,
    position: 'absolute',
    top: '1%',
    left: '1%',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    zIndex: 999,
    paddingHorizontal: 18,
  },
  msgtxt: {
    color: 'white',
    fontSize: 16,
    width: '84%',
    height: 23,
  },
});
