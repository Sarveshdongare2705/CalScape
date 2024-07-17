import firestore from '@react-native-firebase/firestore';

export const calculateReduction = async uid => {
  let val1 = 0;
  let val2 = 0;

  const currentTime = new Date();
  const timestamp = {
    month: currentTime.getMonth() + 1,
    year: currentTime.getFullYear(),
  };

  const footprintRef = firestore()
    .collection('Users')
    .doc(uid)
    .collection('Footprint')
    .doc(`${timestamp.month}-${timestamp.year}`);

  const doc = await footprintRef.get();
  if (doc.exists) {
    const data = doc.data();
    val1 =
      (data.basicDetails ? data.basicDetails : 0) +
      (data.recycleDetails ? data.recycleDetails : 0) +
      (data.travelDetails ? data.travelDetails : 0) +
      (data.electricityDetails ? data.electricityDetails : 0) +
      (data.energyDetails ? data.energyDetails : 0) +
      (data.foodDetails ? data.foodDetails : 0) +
      (data.clothingDetails ? data.clothingDetails : 0) +
      (data.extraDetails ? data.extraDetails : 0);
  }

  const footprintRef2 = firestore()
    .collection('Users')
    .doc(uid)
    .collection('Footprint')
    .doc(`${timestamp.month - 1}-${timestamp.year}`);

  const doc2 = await footprintRef2.get();
  if (doc2.exists) {
    const data = doc2.data();
    val2 =
      (data.basicDetails ? data.basicDetails : 0) +
      (data.recycleDetails ? data.recycleDetails : 0) +
      (data.travelDetails ? data.travelDetails : 0) +
      (data.electricityDetails ? data.electricityDetails : 0) +
      (data.energyDetails ? data.energyDetails : 0) +
      (data.foodDetails ? data.foodDetails : 0) +
      (data.clothingDetails ? data.clothingDetails : 0) +
      (data.extraDetails ? data.extraDetails : 0);
  }

  let reducedValue = {
    value: null,
    status: null,
    percentage: null,
  };

  if (doc.exists && doc2.exists) {
    if (parseInt(val1) <= parseInt(val2)) {
      const reductionPercentage = 100 - (parseInt(val1) / parseInt(val2)) * 100;
      reducedValue = {
        value: parseInt(val2) - parseInt(val1),
        percentage: reductionPercentage.toFixed(1),
        status: 'decreased',
      };
    } else {
      const increasePercentage =
        ((parseInt(val1) - parseInt(val2)) / parseInt(val2)) * 100;
      reducedValue = {
        value: parseInt(val1) - parseInt(val2),
        percentage: increasePercentage.toFixed(1),
        status: 'increased',
      };
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth()+1;
    const currentYear = currentDate.getFullYear();
    const docId = `${currentMonth}-${currentYear}`;
    await firestore().collection('Users').doc(uid).collection('Reduction').doc(docId).set(
      {
        status : reducedValue.status,
        value : reducedValue.value,
        percentage : reducedValue.percentage,
      },
      {merge: true},
    );
  }

  return reducedValue;
};

const leagues = {
  Rainforest: {
    decrease: {
      text: 'Congratulations! You are in the Rainforest league. Your significant reduction in carbon footprint is making a huge impact!',
      imageUrl: 'https://cdn-icons-png.flaticon.com/128/7922/7922738.png',
    },
    increase: {
      thresholds: [150, 80, 50, 30, 0],
      downgrade: ['Seedling', 'Sapling', 'Tree', 'Forest', 'Rainforest'],
      text: 'Your carbon footprint has increased. Let’s strive to get back to the Rainforest league by reducing our emissions!',
    },
  },
  Forest: {
    decrease: {
      text: 'Well done! You are in the Forest league. Keep up the great work in reducing your carbon footprint!',
      imageUrl: 'https://cdn-icons-png.flaticon.com/128/685/685022.png',
    },
    increase: {
      thresholds: [120, 90, 40, 0],
      downgrade: ['Seedling', 'Sapling', 'Tree', 'Forest'],
      text: 'Your carbon footprint has increased. Let’s work together to reduce emissions and move back to the Forest league!',
    },
  },
  Tree: {
    decrease: {
      text: 'Great job! You are in the Tree league. Your efforts in reducing emissions are paying off!',
      imageUrl: 'https://cdn-icons-png.flaticon.com/128/2713/2713505.png',
    },
    increase: {
      thresholds: [100, 50, 0],
      downgrade: ['Seedling', 'Sapling', 'Tree'],
      text: 'Your carbon footprint has increased. Let’s work on reducing emissions to climb back to the Tree league!',
    },
  },
  Sapling: {
    decrease: {
      text: 'Good work! You are in the Sapling league. Continue your efforts to reduce your carbon footprint!',
      imageUrl: 'https://cdn-icons-png.flaticon.com/128/11639/11639345.png',
    },
    increase: {
      thresholds: [70, 0],
      downgrade: ['Seedling', 'Sapling'],
      text: 'Your carbon footprint has increased. Let’s focus on reducing emissions to stay in the Sapling league!',
    },
  },
  Seedling: {
    decrease: {
      text: 'You are in the Seedling league. Keep pushing forward to reduce your carbon footprint and climb the leagues!',
      imageUrl: 'https://cdn-icons-png.flaticon.com/128/2227/2227504.png',
    },
    increase: {
      thresholds: [0],
      downgrade: ['Seedling'],
      text: 'Your carbon footprint has increased. Let’s make an effort to reduce emissions and improve our league!',
    },
  },
};

export const determineLeague = async uid => {
  try {
    const userDoc = await firestore()
      .collection('UserData')
      .doc(uid)
      .collection('BasicDetails')
      .doc(`basic_details:${uid}`)
      .get();

    if (!userDoc.exists) {
      return {
        leagueName: 'Unknown',
        text: 'User data not found. Please ensure your profile is complete.',
        imageUrl: 'https://cdn-icons-png.flaticon.com/128/7855/7855635.png',
      };
    }

    const userData = userDoc.data();
    console.log(userData);
    const incomeLevel = userData?.income;

    // Fetch reduction percentage and status (increased or decreased)
    const reductionData = await calculateReduction(uid);

    const {percentage, status} = reductionData;

    // Fetch the previous and current league from the user's document
    const userLeagueDoc = await firestore().collection('Users').doc(uid).get();

    const userLeagueData = userLeagueDoc.data();
    const previousLeague = userLeagueData?.previousLeague || null;
    const currentLeague = userLeagueData?.currentLeague || 'Seedling';

    let leagueName = currentLeague;
    let imageUrl = leagues[currentLeague].decrease.imageUrl;
    let leagueText = leagues[currentLeague].decrease.text;

    // Define thresholds for each income level
    let thresholds = [0, 20, 40, 60, 80, 100]; // Default thresholds for higher income levels

    // Adjust thresholds for lower income levels
    switch (incomeLevel) {
      case 'Less Than 125000':
        thresholds = [0, 15, 30, 45, 60, 100];
        break;
      case '125,000 - 500,000':
        thresholds = [0, 18, 36, 54, 72, 100];
        break;
      case '500,000 - 30,00,000':
        thresholds = [0, 23, 47, 64, 85, 100]; // Same as default
        break;
      case 'Above 30,00,000':
        thresholds = [0, 30, 50, 70, 90, 100]; // Same as default
        break;
      default:
        thresholds = [0, 20, 40, 60, 80, 100]; // Default thresholds if income level is not found
        break;
    }

    // Determine league based on reduction percentage and status
    if (status === 'decreased') {
      if (percentage >= thresholds[4]) {
        leagueName = 'Rainforest';
      } else if (percentage >= thresholds[3]) {
        leagueName = 'Forest';
      } else if (percentage >= thresholds[2]) {
        leagueName = 'Tree';
      } else if (percentage >= thresholds[1]) {
        leagueName = 'Sapling';
      } else {
        leagueName = 'Seedling';
      }
      imageUrl = leagues[leagueName].decrease.imageUrl;
      leagueText = leagues[leagueName].decrease.text;
    } else if (status === 'increased') {
      const leagueInfo = leagues[currentLeague];
      for (let i = 0; i < leagueInfo.increase.thresholds.length; i++) {
        if (percentage >= leagueInfo.increase.thresholds[i]) {
          leagueName = leagueInfo.increase.downgrade[i];
          imageUrl = leagues[leagueName].decrease.imageUrl;
          leagueText = leagues[leagueName].increase.text;
          break;
        }
      }
    }

    // Update the user's league information in Firestore if calculated league different than current league
    if (leagueName !== currentLeague) {
      await firestore().collection('Users').doc(uid).set(
        {
          previousLeague: currentLeague,
          currentLeague: leagueName,
        },
        {merge: true},
      );
    } else {
      await firestore().collection('Users').doc(uid).set(
        {
          previousLeague: previousLeague,
          currentLeague: currentLeague,
        },
        {merge: true},
      );
    }
    if (currentLeague === 'Seedling' && leagueName === 'Seedling') {
      await firestore().collection('Users').doc(uid).set(
        {
          previousLeague: currentLeague,
          currentLeague: currentLeague,
        },
        {merge: true},
      );
    }

    return {leagueName, imageUrl, text: leagueText};
  } catch (error) {
    console.error('Error determining league:', error);
    return {
      leagueName: 'Unknown',
      text: 'An error occurred while determining your league. Please try again later.',
      imageUrl: 'https://cdn-icons-png.flaticon.com/128/7855/7855635.png',
    };
  }
};

export default determineLeague;
