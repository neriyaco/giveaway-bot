interface ICommand {
    readonly args: any[];
    readonly name: string;
    readonly user: string;

    run(): any;
}