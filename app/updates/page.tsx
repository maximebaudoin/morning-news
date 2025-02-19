"use client";

import { useEffect, useState } from "react";
import { Release } from "../api/route";

export default function Page() {
	const [updates, setUpdates] = useState<Release[]>([]);

	useEffect(() => {
		fetch("/api")
			.then((res) => res.json())
			.then((data) => setUpdates(data.releases))
			.catch((err) => console.error("Erreur de chargement:", err));
	}, []);

    console.log(updates);
    

	return (
		<div style={{ fontFamily: "Arial, sans-serif", margin: "40px" }}>
			<header style={{ textAlign: "center", padding: "10px", background: "#f4f4f4" }}>
				<h1>Dernières Mises à Jour</h1>
			</header>
			<table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
				<thead>
					<tr>
						<th style={{ border: "1px solid #ddd", padding: "8px", background: "#0073e6", color: "white" }}>Projet</th>
						<th style={{ border: "1px solid #ddd", padding: "8px", background: "#0073e6", color: "white" }}>Type</th>
						<th style={{ border: "1px solid #ddd", padding: "8px", background: "#0073e6", color: "white" }}>Version</th>
					</tr>
				</thead>
				<tbody>
					{updates.map((update, index) => (
						<>
							<tr key={`row-${index}`}>
								<td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {update.title}
								</td>
								<td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {update.type}
                                </td>
								<td colSpan={2} style={{ border: "1px solid #ddd", padding: "8px", background: "#f9f9f9" }}>
									{update.version}
								</td>
							</tr>
						</>
					))}
				</tbody>
			</table>
			<footer style={{ textAlign: "center", padding: "10px", background: "#f4f4f4" }}>
				<p>Généré automatiquement</p>
			</footer>
		</div>
	);
}
