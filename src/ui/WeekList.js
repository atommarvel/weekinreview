const DayCell = require('./DayCell.js');
const TodoistClient = require('../data/TodoistClient');

class WeekList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {todos: []};
        this.todoClient = new TodoistClient();
    }

    componentDidMount() {
        this.todoClient.getThisWeeksItems().then(items => {
            this.setState({todos: items});
        });
    }

    render() {
        return (
            <div className="week">
                {this.dayCellsToRender()}
            </div>
        );
    }

    dayCellsToRender() {
        const daysAhead = [0,1,2,3,4,5,6];
        const dayCells = daysAhead.map(ahead => {
            return (
                <DayCell key={ahead.toString()} daysAhead={ahead} todos={this.state.todos[ahead] || []}/>
            )
        });

        return dayCells;
    }
}

module.exports = WeekList;