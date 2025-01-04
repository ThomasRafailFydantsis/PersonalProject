import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";
import Sidebar from "../components/Sidebar1";
import axios from "axios";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

function AfterLogin() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isAuthenticated, userData, roles, AuthError, loading, revalidateAuth } = useAuth();
    const navigate = useNavigate();

    const sidebarRef = useRef(null);
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            closeSidebar();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!loading && isAuthenticated && !userData) {
            revalidateAuth();
        }
    }, [loading, isAuthenticated, userData, revalidateAuth]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get("https://localhost:7295/api/Account");
                const data = response.data;

                // Ensure data exists before sorting
                if (data && Array.isArray(data)) {
                    setLeaderboardData(data);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        fetchLeaderboard();
    }, []);

    // Mask the username to hide parts of it
    const maskUsername = (userName) => {
        if (!userName) return "N/A";
        if (userName.length <= 4) return userName;
        return `${userName.substring(0, 2)}${"*".repeat(userName.length - 3)}${userName.slice(-1)}`;
    };

    useEffect(() => {
        if (!loading && isAuthenticated === false) {
            navigate("/");
        }
    }, [loading, isAuthenticated, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (AuthError && isAuthenticated === false) {
        return (
            <div>
                <h3>Error</h3>
                <p>{AuthError}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (isAuthenticated === null) {
        return <div>Authenticating...</div>;
    }

    const hasNoPermission = !roles.includes("Admin") && !roles.includes("Marker") && !roles.includes("User");

    if (hasNoPermission) {
        return <div>Access denied</div>;
    }

    // Sorting functions for each tab
    const sortByCoins = leaderboardData?.sort((a, b) => (b.coins || 0) - (a.coins || 0));
    const sortByScore = leaderboardData?.sort((a, b) => (b.highestScore || 0) - (a.highestScore || 0));
    const sortByAchievements = leaderboardData?.sort((a, b) => (b.totalAchievements || 0) - (a.totalAchievements || 0));

    return (
        <div style={{ marginTop: "4rem", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "inherit" }}>
            <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />

            <div>
                <h1>Welcome back, {userData?.userName || "User"}</h1>

                {loadingLeaderboard ? (
                    <p>Loading leaderboard...</p>
                ) : leaderboardData ? (
                    <div>
                        <Tabs className="tabs" defaultActiveKey="home" id="uncontrolled-tab-example" >
                            {/* Tab for Most Coins */}
                            <Tab s eventKey="home" title="Most Coins">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Username</th>
                                            <th>Coins</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortByCoins.map((user, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{maskUsername(user.userName)}</td>
                                                <td>{user.coins}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Tab>
                            <Tab eventKey="profile" title="Highest Score">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Username</th>
                                            <th>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortByScore.map((user, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{maskUsername(user.userName)}</td>
                                                <td>{user.highestScore}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Tab>

                            {/* Tab for Most Achievements */}
                            <Tab eventKey="contact" title="Most Achievements">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Username</th>
                                            <th>Achievements</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortByAchievements.map((user, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{maskUsername(user.userName)}</td>
                                                <td>{user.totalAchievements}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Tab>
                        </Tabs>
                        <div>
                            <h2 style={{ marginTop: "2rem", textAlign: "center", color: "#607d8b" }}>Leaderboard</h2>
                        </div>
                    </div>
                ) : (
                    <p>No leaderboard data available.</p>
                )}
            </div>
        </div>
    );
}

export default AfterLogin;