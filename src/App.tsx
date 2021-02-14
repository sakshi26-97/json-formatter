import React from 'react';
import './App.scss';
import Button from 'react-bootstrap/Button'

interface State {
    jsonString: string,
    error: any,
    isSubmitted: boolean,
    isDarkMode: boolean,
    isChecked: Record<string,boolean>
}

const defaultState = {
    jsonString: '',
    error: null,
    isSubmitted: false,
    isDarkMode: false,
    isChecked: {}

};

export default class App extends React.PureComponent<{}, State> {
    private copyTextRef: React.RefObject<HTMLTextAreaElement>;

    constructor(props: any) {
        super(props);
        this.state = {
            ...defaultState
        };
        this.copyTextRef = React.createRef<HTMLTextAreaElement>();
    }

    private handleSearch = (e: any): void => {
        this.setState({
            jsonString: e.target.value,
            isSubmitted: false,
            error: null,
            isChecked: {}
        });
    }

    private handleSubmit = (): void => {
        try {
            this.setState({isSubmitted: true});
            JSON.parse(this.state.jsonString);
        } catch (error) {
            this.setState({
                error: "Not a valid JSON object"
            })
        }
    }

    private toggleMode = (): void => {
        this.setState((prevState: State) => {
            return {
                isDarkMode: !prevState.isDarkMode
            }
        })
        document.body.classList.toggle("dark-mode");
    }

    private onCheck = (e: any, index: string): void => {
        let checked = {...this.state.isChecked};
        checked[index] = e.target.checked
        this.setState({
            isChecked: checked
        })
    }

    private emptyValue = (jsonObject: string) => {
        let value;
        if(jsonObject === "") {
            value = '""';
        } else
        if (Array.isArray(jsonObject) && jsonObject.length === 0) {
            value = "[]";
        } else if (typeof jsonObject === 'object' && jsonObject !== null && Object.keys(jsonObject).length === 0) {
            value = "{}";
        } else {
            value = String(jsonObject);
        }
        return value;
    }

    private renderValue = (jsonObject: Record<string, any>, key: any, parentIndex: string, index: number): any => {
        let value: any;
        if(this.checkObject(jsonObject[key])) {
            value = (<ul className={this.state.isChecked[`${key}-${parentIndex}-${index}`] ? "active" : "nested"}>
                {this.treeView(jsonObject[key], `${parentIndex}-${index}`)}
            </ul>)
        } else {
            if(jsonObject[key] === "") {
                value = ': ""';
            } else if (Array.isArray(jsonObject[key]) && jsonObject[key].length === 0) {
                value = ": []";
            } else if (typeof jsonObject[key] === 'object' && jsonObject[key] !== null && Object.keys(jsonObject[key]).length === 0) {
                value = ": {}";
            } else {
                value = `: ${jsonObject[key]}`
            }
        }
        return value;
    }

    private checkObject = (jsonObject: any): boolean => {
        return (Array.isArray(jsonObject) && jsonObject.length > 0) || (typeof jsonObject === 'object' && jsonObject !== null && Object.keys(jsonObject).length > 0)
    }

    private treeView (jsonObject: any, parentIndex: string): JSX.Element {
        return (<>
                    {  this.checkObject(jsonObject) ?
                        Object.keys(jsonObject).map((key: any, index: number) => (
                            <li key={key}>
                                {this.checkObject(jsonObject[key]) ?
                                    <div className="checkbox">
                                        <label><input type="checkbox" value="" onChange={(e) => this.onCheck(e, `${key}-${parentIndex}-${index}`)}/> {key} </label>
                                    </div> : key
                                }
                                {this.renderValue(jsonObject, key, parentIndex, index)}
                            </li>
                        )) : this.emptyValue(jsonObject)
                    }
                </>);
    }

    private copyToClipboard = (): void => {
        this.copyTextRef.current?.select();
        document.execCommand('copy');
        alert('Copied to clipboard!');
    }

    public render(): JSX.Element {
        const { jsonString, error, isSubmitted, isDarkMode } = this.state;

        let JSONtext = <></>;
        if(isSubmitted) {
            if(error) {
                JSONtext = <div className="error-msg"><p>{error}</p></div>;
            } else {
                JSONtext = (<div className="formatted-container">
                    <ul className="unordered-list">
                        {this.treeView(JSON.parse(jsonString), '')}
                    </ul>
                    <div onClick={this.copyToClipboard} className="copy-icon"><i className="far fa-copy"></i></div>
                </div>);
            }
        }

        return (
            <>
                <div className="container">
                    <Button variant="light mode" onClick={this.toggleMode}>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Button>
                        <form className="form-inline form-container">
                            <div className="form-group">
                                <textarea className="form-control" placeholder="Enter JSON Object"  name="jsonString" onChange={this.handleSearch} onPaste={this.handleSearch} ref={this.copyTextRef}/>
                            </div>
                            <Button variant="primary" onClick={this.handleSubmit}>Submit</Button>
                        </form>
                </div>
                {JSONtext}
            </>
        );
    }
}
