try:
    import pyinsane.src.abstract as pyinsane
except:
    print "Unable to import Pyinsame libs"

class Scanner:
    
    def getScannerList(self):
        scanOption = {}
        for device in pyinsane.get_devices():
            scanOption[device.name] = {}
            for opt in device.options.values():
                if opt.name == "mode":
                    scanOption[device.name]["mode"] = opt.constraint
                elif opt.name == "source":
                    scanOption[device.name]["source"] = opt.constraint
                elif opt.name == "resolution":
                    scanOption[device.name]["resolution"] = {"min": opt.constraint[0], "max": opt.constraint[1], "step": opt.constraint[2]}

        return scanOption
        
