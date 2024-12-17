//import { useEffect, useState } from "react";
//import Header from "../components/Header";
//import axios from "../../AxiosConf";

//function Scores({ id }) {
//    const [scores, setScores] = useState([]);

//    useEffect(() => {
//        const fetchScores1 = async () => {
//            try {
//                const response = await axios.get(`https://localhost:7295/api/Exam/results/${id}`);
//                setScores(response.data); // Accessing response.data
//            } catch (error) {
//                console.error("Error fetching certificates:", error);
//            }
//        };
//        fetchScores1();
//    }, [id]);

//    return (
//        <div>
//            <Header />
//            <h1>Scores</h1>
//            <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
//                <thead>
//                    <tr>
//                        <th>Certificate</th>
//                        <th>Score</th>
//                        <th>Date Taken</th>
//                    </tr>
//                </thead>
//                <tbody>
//                    {scores.map((user, index) => (
//                        <tr key={index}>
//                            <td>{user.certName}</td>
//                            <td>{user.score}</td>
//                            <td>{new Date(user.dateTaken).toLocaleDateString()}</td>
//                        </tr>
//                    ))}
//                </tbody>
//            </table>
//        </div>
//    );
//}

//export default Scores;