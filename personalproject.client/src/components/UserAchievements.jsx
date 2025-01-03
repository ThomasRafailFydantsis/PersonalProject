import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider"; 
import {GrAchievement} from 'react-icons/gr';

const UserAchievements = () => {
  const { userData } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!userData?.id) {
        setError("User ID is required.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://localhost:7295/api/Certificates/${userData.id}/achievements`);
        
        setAchievements(response.data);
      } catch (err) {
        setError("An error occurred while fetching achievements.");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userData]); 

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div >
      <h2 style={{ textAlign: 'center', margin:"2rem"}}>User Achievements</h2>
      {achievements.length === 0 ? (
        <p>No achievements found.</p>
      ) : (
        <div className="card-container">
        {achievements.map((achievement, index) => (
            <div className="card" style={{width: '60rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(32deg, rgba(169, 106, 106,0.7) 45%, rgba(183,121,37,0.5) 100%)', padding: '10px', marginBottom: '10px'}} key={`${achievement.achievementId}-${index}`}>
                 <div style={{padding: '10px', color:' aliceblue'}}>  <GrAchievement size={50}  /></div>
              <strong >{achievement.achievementTitle}</strong>
             <div></div>
              <div style={{width: '20rem', overflow: 'visible', textOverflow: 'ellipsis', whiteSpace: 'wrap'}}>{achievement.achievementDescription}</div>
              <div>
              <p>Coins Reward: {achievement.achievementRewardCoins}</p>
              <p>Unlocked On: {new Date(achievement.unlockedOn).toLocaleDateString()}</p>
              </div>
            </div>
            
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAchievements;