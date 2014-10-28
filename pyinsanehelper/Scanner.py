try:
    import pyinsane.src.abstract as pyinsane
except:
    print "Unable to import Pyinsame libs"

class Scanner:
    
    def getScannerList(self):
        scanOption = {}
        for scanner in pyinsane.get_devices():
            scanOption[str(scanner)] = {}
            for opt in scanner.options.values():
                if opt.name == "mode":
                    scanOption[str(scanner)]["mode"] = opt.constraint
                elif opt.name == "source":
                    scanOption[str(scanner)]["source"] = opt.constraint
                elif opt.name == "resolution":
                    scanOption[str(scanner)]["resolution"] = {"min": opt.constraint[0], "max": opt.constraint[1], "step": opt.constraint[2]}

        return scanOption
        
