import React, { useState, useEffect } from 'react';
import { useFetching } from './hooks/useFetching.ts';
import { ICoffee } from './types/CoffeeTypes.ts';
import { Coffee, CoffeeData, ContainerStructure } from "./models/BaseStructures.ts";
import "./App.css";
import { IContainer } from "./types/ContainerTypes.ts";
import CoffeeList from "./components/CoffeeList/CoffeeList.tsx";
import ContainerList from "./components/ContainerList/ContainerList.tsx";
import updateOptions from "./utils/optionsForType.ts";
import CreateCustomCoffee from "./components/UI/create custom coffee/CreateCustomCoffee.tsx";
import CreateCustomContainer from "./components/UI/create custom container/CreateCustomContainer.tsx";
import { placeCoffeeInContainer } from './utils/greedyAlgorithm.ts';
import { BaseCoffee } from './models/BaseCoffee';
import { Container } from './models/Container';
import ContainerVisualizer from "./components/container-visualizer/ContainerVisualizer.tsx";
import { optimizeCoffeeLoadingDP } from "./utils/optimizeCoffeeLoadingDP.ts";
import Button from "./components/UI/my-button/Button.tsx";
import Popup from "./components/UI/popup/Popup.tsx";
import {
    fetchAllReports,
    fetchCoffeeData,
    fetchContainerData,
    fetchSelectedCoffeeData,
    fetchSelectedContainerData
} from "./utils/api.ts";
import Report from "./components/UI/report/Report.tsx";
import ReportsListPopup from "./components/UI/reports-list-popup/ReportsListPopup.tsx";
import {log} from "node:util";

const App: React.FC = () => {
    const [currentTypeOfCoffee, setCurrentTypeOfCoffee] = useState("ground coffee");
    const [options, setOptions] = useState<Coffee[]>([]);
    const [typeOfSelectedCoffee, setTypeOfSelectedCoffee] = useState("");
    const [coffeeData, setCoffeeData] = useState<CoffeeData>({
        name: undefined,
        weight: undefined,
        height: undefined,
        width: undefined,
        type: "ground coffee",
        custom: 'short',
        quantity: undefined
    });

    const [containerData, setContainerData] = useState<ContainerStructure>({
        name: undefined,
        width: undefined,
        height: undefined,
    });

    const [containerResults, setContainerResults] = useState<Container | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showReport, setShowReport] = useState(false); // Додаємо стан для звіту
    const [unplacedCoffees, setUnplacedCoffees] = useState<BaseCoffee[]>([]); // Додаємо стан для кави, яка не помістилась
    const [selectedContainer, setSelectedContainer] = useState<IContainer | null>(null);
    const [showReportsList, setShowReportsList] = useState(false);
    const [reportsList, setReportsList] = useState([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null); // Для збереження вибраного звіту



    const coffeeType: Array<Coffee> = [
        { name: "Ground Coffee", value: "ground coffee" },
        { name: "Bean Coffee", value: "bean coffee" },
        { name: "Capsule Coffee", value: "capsule coffee" },
        { name: "Instant Coffee", value: "instant coffee" },
    ];

    useEffect(() => {
        updateOptions(
            currentTypeOfCoffee,
            setOptions,
            setCoffeeData,
        );
    }, [currentTypeOfCoffee]);

    const [fetchCoffee, , , coffeeArray] = useFetching<Array<ICoffee>>(fetchCoffeeData);
    const [fetchSelectedCoffee, , , selectedCoffeeArray] = useFetching<Array<ICoffee>>(fetchSelectedCoffeeData);
    const [fetchContainer, , , containerArray] = useFetching<Array<IContainer>>(fetchContainerData);
    const [fetchSelectedContainer, , , selectedContainerArray] = useFetching<Array<IContainer>>(fetchSelectedContainerData);


    const handleCheckAllReports = async () => {
        try {
            const reports = await fetchAllReports();
            console.log(reports)
            setReportsList(reports);
            setShowReportsList(true);
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    function fetchData() {
        fetchCoffee();
        fetchContainer();
        fetchSelectedCoffee();
        fetchSelectedContainer();
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectCoffeeType = (selectedType: string) => {
        setCurrentTypeOfCoffee(selectedType);
        setCoffeeData(prev => ({ ...prev, type: selectedType }));
    };

    const handleChangeCoffeeData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsedValue = name === 'name' ? value : parseFloat(value);
        setCoffeeData({ ...coffeeData, [name]: parsedValue });
    };

    const handleChangeContainerData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsedValue = name === 'name' ? value : parseFloat(value);
        setContainerData({ ...containerData, [name]: parsedValue });
    };

    const handleSelectTypeOption = (newType: string) => {
        setTypeOfSelectedCoffee(newType);
        setCoffeeData({ ...coffeeData, custom: newType });
    };

    const handleRunGreedyAlgorithm = () => {
        if (!selectedContainer) {
            alert('Please select a container first');
            return;
        }
        const container = new Container(selectedContainer.name, selectedContainer.width, selectedContainer.height);
        const coffeeList = coffeeArray.map(c => new BaseCoffee(c.name, c.type, c.weight, c.height, c.width, c.quantity));
        const result = placeCoffeeInContainer(container, coffeeList);
        setContainerResults(container);
        setUnplacedCoffees(result.unplacedCoffees);
    };

    const handleRunDPAlgorithm = () => {
        if (!selectedContainer) {
            alert('Please select a container first');
            return;
        }
        const container = new Container(selectedContainer.name, selectedContainer.width, selectedContainer.height);
        const coffeeList = coffeeArray.map(c => new BaseCoffee(c.name, c.type, c.weight, c.height, c.width, c.quantity));
        const result = optimizeCoffeeLoadingDP(container, coffeeList);
        setContainerResults(result.container);
        setUnplacedCoffees(result.unplacedCoffees);
    };

    return (
        <div className='container'>
            <div className='div1'>
                <CreateCustomCoffee
                    coffeeType={coffeeType}
                    currentTypeOfCoffee={currentTypeOfCoffee}
                    handleSelectCoffeeType={handleSelectCoffeeType}
                    coffeeData={coffeeData}
                    handleChangeCoffeeData={handleChangeCoffeeData}
                    options={options}
                    typeOfSelectedCoffee={typeOfSelectedCoffee}
                    handleSelectTypeOption={handleSelectTypeOption}
                />
                <CreateCustomContainer
                    containerData={containerData}
                    handleChangeContainerData={handleChangeContainerData}
                />

                <div className="main-row">
                    <Button className="myBtn" onClick={fetchData}>Log DataBase</Button>
                </div>
                <div className="main-row">
                    <Button className="myBtn" onClick={() => setShowPopup(true)}>Select Container</Button>
                </div>
                <div className="main-row">
                    <Button className="myBtn" onClick={handleRunGreedyAlgorithm}>Run Greedy Algorithm</Button>
                </div>
                <div className="main-row">
                    <Button className="myBtn" onClick={handleRunDPAlgorithm}>Run DP Algorithm</Button>
                </div>
                <div className="main-row">
                    <Button className="myBtn" onClick={() => setShowReport(true)}>Generate Report</Button>
                </div>
                <div className="main-row">
                    <Button className="myBtn" onClick={handleCheckAllReports}>Check All Reports</Button>
                </div>
                <div style={{display: "flex"}}>
                    <div>
                        <CoffeeList
                            title='Coffee List'
                            coffees={coffeeArray}
                            fetchCoffees={fetchCoffee}
                            updateFavoritesCoffees={fetchSelectedCoffee}
                        />
                    </div>
                    <div>
                        <ContainerList
                            title='Container List'
                            containers={containerArray}
                            fetchContainer={fetchContainer}
                            updateFavoriteContainer={fetchSelectedContainer}
                        />
                    </div>
                </div>
            </div>
            <div className='div2'>
                <div style={{display: "flex"}}>
                    <div>
                    <CoffeeList
                            favorite={true}
                            title='Favorite Coffees'
                            coffees={selectedCoffeeArray}
                            fetchCoffees={fetchSelectedCoffee}
                        />
                    </div>
                    <div>
                        <ContainerList
                            favorite={true}
                            title='Favorite Containers'
                            containers={selectedContainerArray}
                            fetchContainer={fetchSelectedContainer}
                        />
                    </div>
                </div>
                {containerResults && (
                    <ContainerVisualizer container={containerResults} />
                )}
                <Popup show={showPopup} handleClose={() => setShowPopup(false)}>
                    <h2>Select a Container</h2>
                    <ul>
                        {containerArray.map(container => (
                            <li key={container._id} onClick={() => {
                                setSelectedContainer(container);
                                setShowPopup(false);
                            }}>
                                {container.name} - {container.width}x{container.height}
                            </li>
                        ))}
                    </ul>
                </Popup>
                {showReport && containerResults && (
                    <Report
                        container={containerResults}
                        unplacedCoffees={unplacedCoffees}
                        onClose={() => setShowReport(false)}
                    />
                )}
                {showReportsList && (
                    <ReportsListPopup
                        reports={reportsList}
                        onClose={() => setShowReportsList(false)}
                        onViewDetail={(reportId) => {
                            const report = reportsList.find(r => r._id === reportId);
                            if (report) {
                                setSelectedReport(report);
                                setShowReport(true);
                                console.log(selectedReport)
                            }
                        }}
                    />
                )}


            </div>
        </div>
    );
};

export default App;
