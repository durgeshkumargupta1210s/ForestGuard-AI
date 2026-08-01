function DashboardHeader() {

    const today = new Date();

    return (

        <div className="flex justify-between items-center mb-8">

            <div>

                <h1 className="text-4xl font-bold">

                    Dashboard

                </h1>

                <p className="text-slate-400 mt-2">

                    AI Forest Monitoring Overview

                </p>

            </div>

            <div className="text-right">

                <p className="text-slate-400">

                    Last Updated

                </p>

                <p className="font-semibold">

                    {today.toLocaleString()}

                </p>

            </div>

        </div>

    );

}

export default DashboardHeader;