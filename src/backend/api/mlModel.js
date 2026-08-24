const { spawn } = require("child_process");
const path = require("path");

class MLModel {
    async predict(patientData) {
        return new Promise((resolve, reject) => {
            const pythonScript = path.resolve(
                __dirname,
                "../../../ml_pipeline/predict.py"
            );

            const pythonProcess = spawn("python", [
                pythonScript,
                JSON.stringify(patientData)
            ]);

            let output = "";
            let errorOutput = "";

            pythonProcess.stdout.on("data", (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on("close", (code) => {
                if (code !== 0) {
                    reject(
                        new Error(
                            errorOutput || "Python prediction failed."
                        )
                    );
                    return;
                }

                try {
                    const result = JSON.parse(output.trim());
                    resolve(result);
                } catch (error) {
                    reject(
                        new Error(
                            `Invalid prediction response: ${output}`
                        )
                    );
                }
            });
        });
    }
}

const mlModel = new MLModel();

module.exports = mlModel;