const useEvaluationCheck = async (project: number) => {
    console.log(`https://student.themarkers.nl/api/student/hu:open-ict/evaluations?project_id=${project}`)

    const response = await fetch(`https://student.themarkers.nl/api/student/hu:open-ict/evaluations?project_id=${project}`);
    const data = await response.json();
    const evaluations = data.evaluations;

    let count = 0;
    let isCheckedInToday = false;

    const currentDate = new Date().toISOString().split('T')[0];

    for (const evaluation of evaluations) {
        if (evaluation.rubric_id === 10601) {
            count++;

            if (new Date(evaluation.created_time).toISOString().split('T')[0] === currentDate) {
                isCheckedInToday = true;
            }
        }
    }

    return({
        count,
        checkedIn: isCheckedInToday
    });
}

export default useEvaluationCheck