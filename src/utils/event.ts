class EventEmitter {
  private events: { [key: string]: Function[] } = {};
  public on<T extends Function = any>(evName: string, cb: T) {
    const events = (this.events[evName] ??= []);
    events.push(cb);
  }
  public emit<T = any>(evName: string, data?: T) {
    const events = (this.events[evName] ??= []);
    events.forEach((event) => event(data));
  }
  public once<T extends Function = any>(evName: string, cb: T) {
    const events = (this.events[evName] ??= []);
    const wrapper: any = (arg: any) => {
      cb(arg);
      this.off(evName, cb);
    };
    wrapper.cb = cb;
    events.push(wrapper);
  }
  public off<T extends Function = any>(evName: string, cb?: T) {
    const events = (this.events[evName] ??= []);
    if (!cb) {
      this.events[evName] = [];
    } else {
      this.events[evName] = events.filter((event) =>
        [event, !(event as any).cb].includes(cb)
      );
    }
  }
}

const event = new EventEmitter();
export default event;
