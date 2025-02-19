"use client";

import { useEffect, useState } from "react";
import { Release } from "../api/route";

export default function Page() {
	const [updates, setUpdates] = useState<Release[]>([]);
    const [currentDate, setCurrentDate] = useState<string>("");

	useEffect(() => {
		fetch("/api")
			.then((res) => res.json())
			.then((data) => setUpdates(data.releases))
			.catch((err) => console.error("Erreur de chargement:", err));

            const today = new Date();
            const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const formattedDate = today.toLocaleDateString('fr-FR', options)
            setCurrentDate(formattedDate.replace(',', '').replace('.', ''));
        }, []);

	return (
		<div style={{ }}>
			<header style={{ textAlign: "center" }}>
				<h1>Morning News</h1>
                <h4>{currentDate}</h4>
			</header>
            <hr style={{ margin: '20px 0', borderStyle: 'solid', borderWidth: 2, borderBottom: 'none' }} />
            <div>
                {updates.map((update, index) => (
                    <div key={index} style={{ margin: '10px 0 20px 0', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <b>
                                <u>
                                    {update.title}
                                </u>
                            </b>
                            <i style={{ marginLeft: 'auto' }}>
                                {update.type}
                            </i>
                        </div>
                        <b style={{ textAlign: 'center' }}>
                            {update.version}
                        </b>
                        <hr style={{ width: 50, margin: '20px auto', borderStyle: 'dashed', borderWidth: 2, borderBottom: 'none' }} />
                    </div>
                ))}
            </div>
            <hr style={{ margin: '20px 0 0 0', borderStyle: 'solid', borderWidth: 2, borderBottom: 'none' }} />
		</div>
	);
}
